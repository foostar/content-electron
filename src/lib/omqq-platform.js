import Platform from './platform';
import WebviewHelper from 'utils/webview-helper';

export default class OMQQPlatform extends Platform {
    loginUrl = 'https://om.qq.com/userAuth/index'
    publishUrl = 'https://om.qq.com/article/articlePublish'
    statsUrl = 'https://om.qq.com/statistic/ArticleReal?media=5394191&channel=0&page=2&num=8&btime=1&relogin=1'
    async _isLogin (webview) {
        const helper = new WebviewHelper(webview);
        const data = await helper.fetchJSON('https://om.qq.com/article/list?index=1&commentflag=0&source=0&relogin=1');
        return data.response.code !== -10403;
    }
    _login (webview) {
        const helper = new WebviewHelper(webview);
        return new Promise((resolve, reject) => {
            const {loginUrl, account, password} = this;
            webview.loadURL(loginUrl);

            // const timer = setTimeout(() => {
            //     reject(new Error('timeout'));
            // }, 10000);

            const didDomReady = async () => {
                const url = webview.getURL();
                // 登录界面
                if (url.startsWith(loginUrl)) {
                    helper.executeJavaScript(`
                        (function() {
                            var el = document.querySelector('#LEmail')
                            if (!el) return setTimeout(arguments.callee, 200);
                            el.value = '${account}';
                            document.querySelector('#LPassword').value = '${password}';
                            document.querySelector('.btnLogin').click();
                        })();
                    `);
                }

                // 登录成功, 获取 cookies
                if (url === 'https://om.qq.com/') {
                    try {
                        const cookies = await helper.getCookies();
                        const session = cookies.map(item => {
                            item.url = 'https://om.qq.com/';
                            return item;
                        });
                        const nickname = await helper.executeJavaScript('document.querySelector(".header-login-inner .name").innerText;');
                        resolve({session, nickname});
                    } catch (err) {
                        reject(err);
                    } finally {
                        // clearTimeout(timer);
                        webview.removeEventListener('dom-ready', didDomReady);
                    }
                }
            };
            webview.addEventListener('dom-ready', didDomReady);
        });
    }
    _publish (webview, title, data) {
        const helper = new WebviewHelper(webview);
        return new Promise(async (resolve, reject) => {
            const {publishUrl} = this;
            webview.loadURL(publishUrl);

            const didDomReady = async () => {
                const url = webview.getURL();
                if (url.startsWith(publishUrl)) {
                    this.injectPublishScript(webview, title, data);
                }
                try {
                    // 企鹅号
                    // const res = await this.getRresponse('https://om.qq.com/article/publish?relogin=1');
                    const res = await helper.getRresponse('https://om.qq.com/article/getWhiteListOfWordsInTitle?relogin=1');
                    const result = JSON.parse(res.body);
                    console.log(result);
                    const link = encodeURIComponent(result.data.article.Furl.replace(/https?:\/\//, ''));
                    resolve(link);
                } catch (err) {
                    reject(err);
                } finally {
                    webview.removeEventListener('dom-ready', didDomReady);
                }
            };
            webview.addEventListener('dom-ready', didDomReady);
        });
    }

    injectPublishScript (webview, title, {content}) {
        const helper = new WebviewHelper(webview);
        return helper.executeJavaScript(`
            (function() {
                const el = document.querySelector('#ueditor_0');
                if (!el) return setTimeout(arguments.callee, 200);
                $('#om-art-normal-title input').val(\`${title}\`);
                window.frames['ueditor_0'].contentWindow.document.body.innerHTML = '';
                $('#edui14_body').click();
                $('.layui-layer-content textarea').val(\`${content}\`)
                $('.layui-layer-btn0').click();
                $('.ui-radio[data-id="auto"]').click();
                $('.icon-toggle-up-b').click();

                $('.side').remove();
                $('.main-heading').remove();
                $('.header').remove();
                $('.wrap').css({paddingTop: 0});
                $('.main').css({float: 'none', width: 'auto'});
                $('.viewpage').css({minWidth: 'initial'});
                $('#editor-mask').css({width: 'auto'});
                $('.container').css({width: 'auto'})
                $('.fixed-bottom .form-action .toggle').css({left: 100});
            })();
        `);
    }

    _stats (webview, startTime, endTime) {
        const helper = new WebviewHelper(webview);

        return new Promise((resolve, reject) => {
            let page = 1;
            let result = [];
            const injectGetStatsScript = async () => {
                // const res = await this.executeJavaScript(`
                //     fetch('https://om.qq.com/statistic/ArticleReal?channel=0&page=${page}&num=100&btime=1&relogin=1', {
                //         credentials: 'include'
                //     }).then(res => res.json())
                // `);

                const res = await helper.fetchJSON(`https://om.qq.com/statistic/ArticleReal?channel=0&page=${page}&num=100&btime=1&relogin=1`);

                const {statistic = []} = res.data;

                result.push(...statistic);

                if (statistic.length === 100) {
                    page += 1;
                    return await injectGetStatsScript();
                }

                webview.removeEventListener('dom-ready', injectGetStatsScript);

                result = result.map(item => {
                    return {
                        link: `kuaibao.qq.com/s/${item.articleId}`,
                        view: item.read,
                        title: item.title,
                        custom: item
                    };
                });

                resolve(result);
            };
            webview.loadURL('https://om.qq.com/');
            webview.addEventListener('dom-ready', injectGetStatsScript);
        });
    }

}
