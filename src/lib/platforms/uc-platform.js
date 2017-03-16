import Platform from 'lib/platform';
import moment from 'moment';
import WebviewHelper from 'utils/webview-helper';

export default class BaijiaPlatform extends Platform {
    platformId = 'uc'
    loginUrl = 'http://mp.uc.cn/index.html'
    publishUrl = 'http://mp.uc.cn/dashboard/article/write'
    submitUrl = 'http://mp.uc.cn/dashboard/contents/submit'
    async _isLogin (webview) {
        const helper = new WebviewHelper(webview);
        const data = await helper.fetchJSON(`http://mp.uc.cn/api/ws/stat/wemedia/summary?date=${moment(new Date()).format('YYYYMMDD')}&_=${Date.now()}`);
        if (!data.data) return false;
        return true;
    }
    _login (webview) {
        const helper = new WebviewHelper(webview);
        return new Promise((resolve, reject) => {
            const {loginUrl, account, password} = this;
            let session;
            helper.load(loginUrl);
            const didDomReady = async () => {
                const url = webview.getURL();
                // 登录界面
                if (url.startsWith(loginUrl)) {
                    await helper.executeJavaScript(`
                        (function() {
                            const el = document.querySelector('.login_body');
                            if (!el) return setTimeout(arguments.callee, 200);
                            const inputs = el.getElementsByTagName('input')
                            inputs[0].value = '${account}';
                            inputs[1].value = '${password}';
                            inputs[0].focus();
                        })();
                    `);
                }

                // 登录成功, 获取 cookies
                if (url === 'http://mp.uc.cn/dashboard/index') {
                    try {
                        const cookies = await helper.getCookies();
                        session = cookies.map(item => {
                            item.url = 'http://mp.uc.cn/';
                            return item;
                        });
                        helper.executeJavaScript('window.location.href="http://mp.uc.cn/dashboard/account/profile#!tab=wm"');
                    } catch (err) {
                        reject(err);
                    }
                }
                if (url === 'http://mp.uc.cn/dashboard/account/profile#!tab=wm') {
                    try {
                        const nickname = await helper.executeJavaScript(`
                            new Promise(resolve => {
                                (function () {
                                    const el = document.querySelector('.account-profile-wm_type-text');
                                    if (!el) return setTimeout(arguments.callee, 200);
                                    resolve(el.innerText)
                                })()
                            })
                        `);
                        // console.log(session.length, nickname);
                        resolve({session, nickname});
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
    _publish (webview, title, data) {
        const helper = new WebviewHelper(webview);
        return new Promise(async (resolve, reject) => {
            const {publishUrl} = this;
            await helper.load(publishUrl);

            const didDomReady = async () => {
                // webview.openDevTools();
                const url = webview.getURL();
                if (url.startsWith(publishUrl)) {
                    this.injectPublishScript(webview, title, data);
                }
                try {
                    // uc云观
                    const res = await helper.getRresponse('http://mp.uc.cn/dashboard/save-draft');
                    const result = JSON.parse(res.body);
                    const link = result.data.previewUrl.replace(/http?:\/\//, '');
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
    _submit (webview) {
        const helper = new WebviewHelper(webview);
        return new Promise(async (resolve, reject) => {
            const {publishUrl} = this;
            helper.load(publishUrl);
            const didDomReady = async () => {
                const url = webview.getURL();
                if (url.startsWith(publishUrl)) {
                    this.injectSubmitScript(webview);
                }
                try {
                    // uc云观
                    const res = await helper.getRresponse('http://mp.uc.cn/dashboard/submit-article');
                    const result = JSON.parse(res.body);
                    if (result.data) {
                        resolve();
                    }
                } catch (err) {
                    reject(err);
                } finally {
                    webview.removeEventListener('dom-ready', didDomReady);
                }
            };
            webview.addEventListener('dom-ready', didDomReady);
        });
    }
    async injectSubmitScript (webview) {
        const helper = new WebviewHelper(webview);
        await helper.executeJavaScript(`
            (function () {
                const el = document.querySelector('.w-list');
                if (!el) return setTimeout(arguments.callee, 200);
                const checkbox = el.getElementsByClassName("w-checkbox");
                const len = checkbox.length;
                for(var i = 0; i < len; i++) {
                    checkbox[i].click()
                }
                document.querySelector('.contents-submit_article-btn').click();
                document.querySelector('.w-btn_primary').click();
                document.querySelector('.w-confirm_footer').querySelector('.w-btn_primary').click();
            })()
        `);
    }
    async injectPublishScript (webview, title, {content}) {
        const helper = new WebviewHelper(webview);
        await helper.executeJavaScript(`
            new Promise(resolve => {
                (function() {
                    const el = document.querySelector('#ueditor_0');
                    if (!el) return setTimeout(arguments.callee, 200);
                    const ue = document.querySelector('#ue_editor')
                    if (!ue) return setTimeout(arguments.callee, 200);
                    const title = document.querySelector('.article-write_box-title')
                    title.value = \`${title}\`;
                    const editor = UE.getEditor('ue_editor')
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
        if (!startTime || !endTime) {
            throw Error('no startTime or endTime');
        }
        startTime = moment(startTime).format('YYYYMMDD');
        endTime = moment(endTime).format('YYYYMMDD');

        const helper = new WebviewHelper(webview);
        const start = moment(startTime).format('YYYYMMDD');
        const end = moment(endTime).format('YYYYMMDD');

        const fetchListScript = `
            function fetchList (page = 1, result = []) {
                return fetch(\`http://mp.uc.cn/v2/api/ws/stat/article?size=10&begin_date=${start}&end_date=${end}&page=\${page}&merge_by_date=0&create_limit=1&article_ctg=0&export_excel=0&_=${Date.now()}\`)
                    .then(res => res.json())
                    .then(json => {
                        const { metadata, data } = json;
                        const { page, size, total } = metadata;
                        if ((page * size) < total) {
                            return fetchList(page + 1, result.concat(data));
                        }
                        return result.concat(json.data);
                    });
            }
            fetchList();
        `;
        const list = await helper.executeJavaScript(fetchListScript);
        return list.map(item => {
            return {
                view: Number(item.view_reader_num),
                day: moment(item.day, 'YYYYMMDD').format('YYYY-MM-DD')
            };
        });
    }
}

