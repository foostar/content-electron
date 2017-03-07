import Platform from './platform';
import moment from 'moment';
import WebviewHelper from 'utils/webview-helper';

export default class BaijiaPlatform extends Platform {
    platformId = 'baijia'
    loginUrl = 'http://baijiahao.baidu.com/builder/app/login'
    publishUrl = 'http://baijiahao.baidu.com/builder/article/edit'
    async _isLogin (webview) {
        const helper = new WebviewHelper(webview);
        const data = await helper.fetchJSON('https://baijiahao.baidu.com/builderinner/api/content/marketing/income');
        return data.error_code === 0;
    }
    _login (webview) {
        const helper = new WebviewHelper(webview);
        return new Promise((resolve, reject) => {
            const {loginUrl, account, password} = this;
            webview.loadURL(loginUrl);
            // 登录会有输入验证码的情况, 不能做超时
            // const timer = setTimeout(() => {
            //     reject(new Error('timeout'));
            // }, 10000);

            const didDomReady = async () => {
                const url = webview.getURL();
                // 登录界面
                if (url.startsWith(loginUrl)) {
                    await helper.executeJavaScript(`
                        (function() {
                            const el = document.querySelector('#TANGRAM__PSP_4__userName');
                            if (!el) return setTimeout(arguments.callee, 200);
                            el.value = '${account}';
                            document.querySelector('#TANGRAM__PSP_4__password').value = '${password}';
                            document.querySelector('#TANGRAM__PSP_4__submit').click();
                        })();
                    `);
                }

                // 登录成功, 获取 cookies
                if (url === 'http://baijiahao.baidu.com/') {
                    try {
                        const cookies = await helper.getCookies();
                        const session = cookies.map(item => {
                            item.url = 'http://baijiahao.baidu.com/';
                            return item;
                        });
                        const nickname = await helper.executeJavaScript('document.querySelector(".mp-header-user .author .name").innerText;');
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
                    try {
                        const res = await helper.getRresponse(({res}) => {
                            if (!res.url.match(/baijiahao\.baidu\.com\/builderinner\/api\/content\/article\/(\d+)\/update/)) {
                                return false;
                            }
                            let isPublishReq;
                            try {
                                isPublishReq = JSON.parse(res.body).status === 'analyze';
                            } catch (err) {
                                console.info(err);
                            }
                            if (isPublishReq && isPublishReq.status === 'analyze') {
                                return true;
                            }
                        });
                        const result = JSON.parse(res.body);
                        resolve(result);
                    } catch (err) {
                        reject(err);
                    } finally {
                        webview.removeEventListener('dom-ready', didDomReady);
                    }
                }
            };

            webview.addEventListener('dom-ready', didDomReady);
        });
    }

    async injectPublishScript (webview, title, {content}) {
        const helper = new WebviewHelper(webview);
        await helper.executeJavaScript(`
            (function() {
                const el = document.querySelector('#ueditor_0');
                if (!el) return setTimeout(arguments.callee, 200);
                document.querySelector('#header-wrapper').remove();
                document.querySelector('.aside').remove();
                document.querySelector('.post-article-tips-wrap').remove();
                document.querySelector('.mp-footer').remove();
                document.querySelector('body').style.minWidth = 'initial';
                document.querySelector('#pageWrapper').style.minWidth = 'initial';
                document.querySelector('.editor-footer').style.padding = '10px';
                document.querySelector('.editor-footer').style.minWidth = 'initial';
                document.querySelector('.main').style.padding = 0;
                document.querySelector('.main').style.margin = 0;
                document.querySelector('#article-title').value = \`${title}\`;
                window.frames['ueditor_0'].contentWindow.document.body.innerHTML = \`${content}\`;
                editor.getEditor().focus();
            })();
        `);
        webview.selectAll();
        webview.cut();
        webview.paste();
    }

    _stats (webview, startTime, endTime) {
        const helper = new WebviewHelper(webview);

        return new Promise(async (resolve, reject) => {
            if (startTime) {
                if (!moment(startTime, 'YYYYMMDD').isValid()) return reject('startTime 格式不正确');
            } else {
                startTime = moment().subtract(30, 'days').format('YYYYMMDD');
            }

            if (endTime) {
                if (!moment(endTime, 'YYYYMMDD').isValid()) return reject('endTime 格式不正确');
            } else {
                endTime = moment().format('YYYYMMDD');
            }

            let page = 1;
            let result = [];
            let id;

            const injectGetStatsScript = async () => {
                if (!id) {
                    id = await helper.executeJavaScript(`
                        (function() {
                            el = document.querySelector("a.aside-action");
                            if (!el) return setTimeout(arguments.callee, 200);
                            return el.getAttribute("href").match(/app_id=(\\d+)/)[1];
                        })();
                    `);
                }

                const res = await helper.fetchJSON(`http://baijiahao.baidu.com/builderinner/api/content/analysis/getArticleList?app_id=${id}&start=${startTime}&end=${endTime}&page=${page}&page_size=100`);

                // const res = await this.executeJavaScript(`
                //     fetch('http://baijiahao.baidu.com/builderinner/api/content/analysis/getArticleList?app_id=${id}&start=${startTime}&end=${endTime}&page=${page}&page_size=100', {
                //         credentials: 'include'
                //     }).then(res => res.json())
                // `);

                const {list = []} = res.data;

                result.push(...list);

                const {total_page, cur_page} = res.data;

                if (cur_page < total_page) { // eslint-disable-line
                    page += 1;
                    return await injectGetStatsScript();
                }

                webview.removeEventListener('dom-ready', injectGetStatsScript);

                result = result.map(item => {
                    return {
                        link: `baijiahao.baidu.com/builder/preview/s?id=${item.article_id}`,
                        view: item.view_times,
                        title: item.title,
                        custom: item
                    };
                });
                resolve(result);
            };
            webview.loadURL('http://baijiahao.baidu.com/');
            webview.addEventListener('dom-ready', injectGetStatsScript);
        });
    }
}

