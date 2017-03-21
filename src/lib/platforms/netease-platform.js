import Platform from 'lib/platform';
import moment from 'moment';
import WebviewHelper from 'utils/webview-helper';

export default class NetEasePlatform extends Platform {
    platformId = 'netease'
    loginUrl = 'http://dy.163.com/wemedia/login.html'
    publishUrl = 'http://dy.163.com/'
    wemediaId = ''
    async _isLogin (webview) {
        const helper = new WebviewHelper(webview);
        const data = await helper.fetchJSON(`http://dy.163.com/wemedia/navinfo?t=${Date.now()}&wemediaId=`);
        if (data.code === 1) {
            this.publishUrl += `/wemedia/article/postpage/${data.data.wemediaId}`;
            this.wemediaId = data.data.wemediaId;
            return true;
        }
        return false;
    }
    async _getMes (webview) {
        const helper = new WebviewHelper(webview);
        const data = await helper.fetchJSON(`http://dy.163.com/wemedia/navinfo?t=${Date.now()}&wemediaId=`);
        if (data.code === 1) {
            this.publishUrl += `/wemedia/article/postpage/${data.data.wemediaId}`;
            this.wemediaId = data.data.wemediaId;
        }
    }
    _login (webview) {
        const helper = new WebviewHelper(webview);
        return new Promise(async (resolve, reject) => {
            const {loginUrl, account, password} = this;
            await this._getMes(webview);
            await helper.load(loginUrl);
            const didDomReady = async () => {
                const url = webview.getURL();
                // 登录界面
                if (url.startsWith(loginUrl)) {
                    await helper.executeJavaScript(`
                        (function() {
                            const el = document.querySelector('#loginEmail');
                            if (!el) return setTimeout(arguments.callee, 200);
                            el.value = '${account}';
                            document.querySelector('#loginPassword').value = '${password}';
                        })();
                    `);
                }

                // 登录成功, 获取 cookies
                if (url.match(/http:\/\/dy\.163\.com\/wemedia\/notice\/list/)) {
                    try {
                        const cookies = await helper.getCookies();
                        const session = cookies.map(item => {
                            item.url = 'http://dy.163.com';
                            return item;
                        });
                        const {nickname, publishUrl} = await helper.executeJavaScript(`
                            new Promise(resolve => {
                                (function() {
                                    const el = document.querySelector('#loginUser');
                                    if (!el) return setTimeout(arguments.callee, 200);
                                    const nickname = el.innerHTML;
                                    const publishUrl = document.querySelector("#loginUser").getAttribute("href");
                                    resolve({
                                        nickname,
                                        publishUrl
                                    })
                                })();
                            })
                            
                        `);
                        this.publishUrl += publishUrl;
                        this.wemediaId = publishUrl.substr(publishUrl.lastIndexOf('/') + 1);
                        resolve({session, nickname});
                    } catch (err) {
                        reject(err);
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
            await this._getMes(webview);
            await helper.load(publishUrl);
            const didDomReady = async () => {
                const url = webview.getURL();
                if (url.startsWith(publishUrl)) {
                    this.injectPublishScript(webview, title, data);
                }
                try {
                    // 网易号
                    const res = await helper.getRresponse('http://dy.163.com/wemedia/article/status/api/publish.do');
                    const result = JSON.parse(res.body);
                    const link = result.data.substr(result.data.lastIndexOf(',') + 1);
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
    async injectPublishScript (webview, title, {content}) {
        const helper = new WebviewHelper(webview);
        await helper.executeJavaScript(`
            new Promise(resolve => {
                (function() {
                    const el = document.querySelector('#container');
                    if (!el) return setTimeout(arguments.callee, 200);
                    const title = document.querySelector('#title')
                    title.value = \`${title}\`;
                    el.innerHTML = \`${content}\`;
                    title.focus();
                })();
            })
        `);
    }
    _statByContent (webview) {
        // const helper = new WebviewHelper(webview);
        throw Error('TODO');
    }
    async _statByUpstream (webview, startTime, endTime) {
        if (!startTime || !endTime) {
            throw Error('no startTime or endTime');
        }
        startTime = moment(startTime).format('YYYY-MM-DD');
        endTime = moment(endTime).format('YYYY-MM-DD');

        const helper = new WebviewHelper(webview);

        const fetchListScript = `
            function fetchList (page = 1, result = []) {
                return fetch(\`http://dy.163.com/wemedia/docPvs.json?orderBy=pv&order=desc&start=${startTime}&end=${endTime}&wemediaId=${this.wemediaId}&pageSize=10&pageNo=1\`)
                    .then(res => res.json())
                    .then(json => {
                        const { data } = json;
                        const { pageNo, totalPage } = data;
                        if (pageNo < totalPage) {
                            return fetchList(page + 1, result.concat(data.list));
                        }
                        return result.concat(data.list);
                    });
            }
            fetchList();
        `;
        await this._getMes(webview);
        const list = await helper.executeJavaScript(fetchListScript);
        return list.map(item => {
            return {
                view: Number(item.pv),
                day: moment(item.ptime).format('YYYY-MM-DD')
            };
        });
    }
}

