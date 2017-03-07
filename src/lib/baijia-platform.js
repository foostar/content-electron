import Platform from './platform';
import moment from 'moment';
import {clipboard} from 'electron';
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
        function bodyCheck (res) {
            try {
                return JSON.parse(res.body).status === 'analyze';
            } catch (err) {
                console.info('isPublishReq', err);
            }
        }
        function urlCheck (response) {
            const {url} = response;
            return url.match(/builderinner\/api\/content\/article\/(\d+)\/update/);
        }
        return new Promise(async (resolve, reject) => {
            const {publishUrl} = this;
            webview.loadURL(publishUrl);
            const didDomReady = async () => {
                const url = webview.getURL();
                if (url.startsWith(publishUrl)) {
                    this.injectPublishScript(webview, title, data);
                    try {
                        const res = await helper.getRresponse(urlCheck, bodyCheck);
                        const result = JSON.parse(res.body);
                        const link = result.url.replace(/https?:\/\//, '');
                        resolve(link);
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
            new Promise(resolve => {
                (() => {
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
                    editor.getEditor().focus();
                    resolve()
                })()
            });
        `);
        clipboard.writeHTML(content);
        webview.paste();
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
        // helper.dev();
        webview.loadURL('http://baijiahao.baidu.com/');
        const appId = await helper.executeJavaScript(`
            (function () {
                const el = document.querySelector(".aside-action")
                if (!el) return setTimeout(arguments.callee, 200);
                return el.href.match(/app_id=(\\d+)/)[1];
            })()
        `);
        const start = moment(startTime).format('YYYYMMDD');
        const end = moment(endTime).format('YYYYMMDD');

        const fetchListScript = `
            function fetchList (page = 1, result = []) {
                return fetch(\`http://baijiahao.baidu.com/builderinner/api/content/analysis/getChartInfo?app_id=${appId}&start=${start}&end=${end}&page=\${page}&size=100\`, {credentials: 'include'})
                    .then(res => res.json())
                    .then(json => {
                        if (json.data.page.cur_page < json.data.page.total_page) {
                            return fetchList(page + 1, result.concat(json.data.list));
                        }
                        return result.concat(json.data.list);
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

