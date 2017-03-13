import Platform from './platform';
import WebviewHelper from 'utils/webview-helper';
import moment from 'moment';

export default class OMQQPlatform extends Platform {
    platformId = 'omqq'
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
        return new Promise(async (resolve, reject) => {
            const {loginUrl, account, password} = this;
            await helper.load(loginUrl);

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
            await helper.load(publishUrl);

            const didDomReady = async () => {
                const url = webview.getURL();
                if (url.startsWith(publishUrl)) {
                    this.injectPublishScript(webview, title, data);
                }
                try {
                    // 企鹅号
                    const res = await helper.getRresponse('https://om.qq.com/article/publish?relogin=1');
                    // const res = await helper.getRresponse('https://om.qq.com/article/getWhiteListOfWordsInTitle?relogin=1');
                    const result = JSON.parse(res.body);
                    const link = result.data.article.Furl.replace(/https?:\/\//, '');
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
            ;(function() {
                const el = document.querySelector('#ueditor_0');
                if (!el) return setTimeout(arguments.callee, 200);

                $('.side').remove();
                $('.main-heading').remove();
                $('.header').remove();
                $('.wrap').css({paddingTop: 0});
                $('.main').css({float: 'none', width: 'auto'});
                $('.viewpage').css({minWidth: 'initial'});
                $('#editor-mask').css({width: 'auto'});
                $('.container').css({width: 'auto'});
                $('.fixed-bottom .form-action .toggle').css({left: 100});

                $('#om-art-normal-title input').val(\`${title}\`);
                window.frames['ueditor_0'].contentWindow.document.body.innerHTML = '';
                $('#edui14_body').click();
                $('.layui-layer-content textarea').val(\`${content}\`);
                $('.layui-layer-btn0').click();
                $('.ui-radio[data-id="auto"]').click();
                $('.icon-toggle-up-b').click();
            })();
        `);
    }

    async _statByConent (webview) {
        const helper = new WebviewHelper(webview);

        function avaliblePubTime (data) {
            return moment(data.pubTime).isAfter(
                moment().subtract(15, 'd')
            );
        }

        async function getList (page = 1, result = []) {
            const res = await helper.fetchJSON(`https://om.qq.com/statistic/ArticleReal?channel=0&page=${page}&num=100&btime=1&relogin=1`);
            const {statistic = []} = res.data;
            if (statistic.length === 0) return result;

            const _result = result.concat(statistic);

            const lastItem = statistic[statistic.lenght - 1];

            if (avaliblePubTime(lastItem)) {
                return getList(page + 1, _result);
            }

            return result.filter(avaliblePubTime);
        }

        const list = await getList();
        console.log(list);
        // TODO
        throw Error('还需要根据列表, 抓取单片文章状态');

        //     return {
        //         link: `kuaibao.qq.com/s/${item.articleId}`,
        //         view: item.read,
        //         title: item.title,
        //         custom: item
        //     };
    }

    async _statByUpstream (webview, startTime, endTime) {
        if (!startTime || !endTime) {
            throw Error('no startTime or endTime');
        }
        const helper = new WebviewHelper(webview);
        const cookies = await helper.getCookies();
        const userid = cookies.find(x => x.name === 'userid').value;

        const days = Math.ceil((endTime - startTime) / (60 * 60 * 24 * 1000));
        const btime = ~~(startTime / 1000);
        const etime = ~~(endTime / 1000);
        const res = await helper.fetchJSON(`https://om.qq.com/Statistic/MediaDaily?media=${userid}&channel=0&fields=statistic_date,read,exposure_article,exposure,relay,collect,postil,read_uv&btime=${btime}&etime=${etime}&page=1&num=${days}&merge=0&type=articleDaily&relogin=1`);
        return res.data.statistic.map(item => {
            return {
                view: Number(item.read),
                day: moment(item.statistic_date, 'YYYY-MM-DD').format('YYYY-MM-DD')
            };
        });
    }
}
