import Platform from 'lib/platform';
// import moment from 'moment';
import WebviewHelper from 'utils/webview-helper';

export default class SohuPlatform extends Platform {
    platformId = 'sohu'
    loginUrl = 'http://mp.sohu.com/'
    listUrl = 'http://mp.sohu.com/v2/main/news/list.action'
    publishUrl = 'http://mp.sohu.com/v2/main/news/add.action'
    async _isLogin (webview) {
        const helper = new WebviewHelper(webview);
        return new Promise(async (resolve, reject) => {
            const {listUrl} = this;
            await helper.load(listUrl);
            const didGetResponseDetails = async (event) => {
                if (event.originalURL.startsWith(listUrl)) {
                    webview.removeEventListener('did-get-response-details', didGetResponseDetails);
                    webview.stop();
                    if (event.newURL.startsWith(listUrl)) {
                        return resolve(true);
                    }
                    return resolve(false);
                }
            };
            webview.addEventListener('did-get-response-details', didGetResponseDetails);
        });
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
                    await helper.executeJavaScript(`
                        (function() {
                            const el = document.querySelector('#userid');
                            if (!el) return setTimeout(arguments.callee, 200);
                            el.value = '${account}';
                            document.querySelector('#pwd').value = '${password}';
                        })();
                    `);
                }

                // 登录成功, 获取 cookies
                if (url === 'http://mp.sohu.com/main/home/index.action') {
                    try {
                        const cookies = await helper.getCookies();
                        const session = cookies.map(item => {
                            item.url = 'http://mp.sohu.com';
                            return item;
                        });
                        const nickname = await helper.executeJavaScript(`
                            new Promise(resolve => {
                                (function() {
                                    const el = document.querySelector('.user-name');
                                    if (!el) return setTimeout(arguments.callee, 200);
                                    resolve(el.innerText)
                                })();
                            })
                            
                        `);
                        resolve({session, nickname});
                    } catch (err) {
                        reject(err);
                    }
                }
            };
            webview.addEventListener('dom-ready', didDomReady);
        });
    }
    _getPushlistState (webview) {
        const helper = new WebviewHelper(webview);
        const {publishUrl} = this;
        return new Promise(async (resolve, reject) => {
            await helper.load(publishUrl);
            const state = await helper.executeJavaScript(`
                new Promise(resolve => {
                    (function () {
                        const el = document.querySelector(".publish-tip").querySelector(".font-alert")
                        if (!el) return setTimeout(arguments.callee, 200);
                        resolve(el.innerText);
                    })()
                })
            `);
            resolve(state);
        });
    }
    _publish (webview, title, data) {
        // throw Error('TODO');
        const helper = new WebviewHelper(webview);
        return new Promise(async (resolve, reject) => {
            const {publishUrl} = this;
            await helper.load(publishUrl);
            const didDomReady = async () => {
                const url = webview.getURL();
                if (url.startsWith(publishUrl)) {
                    this.injectPublishScript(webview, title, data);
                }

                if (url === 'http://mp.sohu.com/v2/main/news/list.action') {
                    const link = await helper.executeJavaScript(`
                        new Promise(resolve => {
                            (function() {
                                const el = document.querySelector('.article-content');
                                if (!el) return setTimeout(arguments.callee, 200);
                                const href = el.querySelector('.left-title a').getAttribute('href');
                                resolve(href)
                            })();
                        })
                    `);
                    resolve(link);
                    webview.removeEventListener('dom-ready', didDomReady);
                }
            };
            webview.addEventListener('dom-ready', didDomReady);
        });
    }
    async injectPublishScript (webview, title, {content}) {
        const helper = new WebviewHelper(webview);
        await helper.executeJavaScript(`
            new Promise(resolve => {
                (function() {
                    const el = document.querySelector('#edui1');
                    if (!el) return setTimeout(arguments.callee, 200);
                    const editor = UE.getEditor('editor-container')
                    if (!editor) return setTimeout(arguments.callee, 200);
                    const title = document.getElementsByName('title')[0];
                    title.value = \`${title}\`;
                    editor.ready(function() {
                        setTimeout(() => {
                            editor.setContent(\`${content}\`);
                            title.focus();
                            resolve();
                        }, 0)
                    });
                })();
            })
        `);
    }
    _statByContent (webview) {
        // const helper = new WebviewHelper(webview);
        throw Error('TODO');
    }
    async _statByUpstream (webview, startTime, endTime) {
        throw Error('TODO');
        // if (!startTime || !endTime) {
        //     throw Error('no startTime or endTime');
        // }
        // startTime = moment(startTime).format('YYYY-MM-DD');
        // endTime = moment(endTime).format('YYYY-MM-DD');

        // const helper = new WebviewHelper(webview);

        // const fetchListScript = `
        //     function fetchList (page = 1, result = []) {
        //         return fetch(\`http://dy.163.com/wemedia/docPvs.json?orderBy=pv&order=desc&start=${startTime}&end=${endTime}&wemediaId=${this.wemediaId}&pageSize=10&pageNo=1\`)
        //             .then(res => res.json())
        //             .then(json => {
        //                 const { data } = json;
        //                 const { pageNo, totalPage } = data;
        //                 if (pageNo < totalPage) {
        //                     return fetchList(page + 1, result.concat(data.list));
        //                 }
        //                 return result.concat(data.list);
        //             });
        //     }
        //     fetchList();
        // `;
        // const list = await helper.executeJavaScript(fetchListScript);
        // return list.map(item => {
        //     return {
        //         view: Number(item.pv),
        //         day: moment(item.ptime).format('YYYY-MM-DD')
        //     };
        // });
    }
}

