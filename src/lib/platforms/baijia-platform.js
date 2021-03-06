import Platform from 'lib/platform';
import moment from 'moment';
import WebviewHelper from 'utils/webview-helper';
import _ from 'lodash';

export default class BaijiaPlatform extends Platform {
    platformId = 'baijia'
    loginUrl = 'http://baijiahao.baidu.com/builder/app/login'
    publishUrl = 'http://baijiahao.baidu.com/builder/article/edit'
    async _isLogin (webview) {
        const helper = new WebviewHelper(webview);
        return new Promise(async (resolve, reject) => {
            const {publishUrl} = this;
            await helper.load(publishUrl);
            const didGetResponseDetails = async (event) => {
                if (event.originalURL.startsWith(publishUrl)) {
                    webview.removeEventListener('did-get-response-details', didGetResponseDetails);
                    webview.stop();
                    if (event.newURL.startsWith(publishUrl)) {
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
    _getPushlistState (webview) {
        const helper = new WebviewHelper(webview);
        const {publishUrl} = this;
        return new Promise(async (resolve, reject) => {
            await helper.load(publishUrl);
            const state = await helper.executeJavaScript(`
                new Promise(resolve => {
                    (function () {
                        const el = document.querySelector(".mod-limit").querySelector(".num")
                        if (!el) return setTimeout(arguments.callee, 200);
                        resolve(el.innerText);
                    })()
                })
            `);
            resolve(state);
        });
    }
    _publish (webview, title, data) {
        const helper = new WebviewHelper(webview);
        let link = '';
        // function bodyCheck (res) {
        //     try {
        //         return JSON.parse(res.body).status === 'analyze';
        //     } catch (err) {
        //         console.info('isPublishReq', err);
        //     }
        // }
        // function urlCheck (response) {
        //     const {url} = response;
        //     return url.match(/builderinner\/api\/content\/article\/(\d+)\/update/);
        // }
        return new Promise(async (resolve, reject) => {
            console.log(222);
            const {publishUrl} = this;
            await helper.load(publishUrl);
            const didDomReady = async () => {
                const url = webview.getURL();
                if (url.startsWith(publishUrl)) {
                    this.injectPublishScript(webview, title, data);
                    try {
                        const res = await helper.getRresponse('http://baijiahao.baidu.com/builderinner/api/content/article/create');
                        const result = JSON.parse(res.body);
                        link = result.url.replace(/http?:\/\//, '');
                    } catch (err) {
                        reject(err);
                    }
                }
                if (url.startsWith('http://baijiahao.baidu.com/builder/article/list')) {
                    console.log(111);
                    resolve(link);
                    webview.removeEventListener('dom-ready', didDomReady);
                }
            };
            webview.addEventListener('dom-ready', didDomReady);
        });
    }

    injectPublishScript (webview, title, {content}) {
        const helper = new WebviewHelper(webview);
        helper.executeJavaScript(`
            (function () {
                const el = document.querySelector('#ueditor_0');
                if (!el) return setTimeout(arguments.callee, 200);
                editor = editor.getEditor()
                editor.ready(function() {
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
                    // window.frames['ueditor_0'].contentWindow.document.body.innerHTML = \`${content}\`;
                    editor.setContent(\`${content}\`);
                });
            })()
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
        await helper.load('http://baijiahao.baidu.com/');
        const appId = await helper.executeJavaScript(`
            new Promise(resolve => {
                (function () {
                    const el = document.querySelector(".aside-action")
                    if (!el) return setTimeout(arguments.callee, 200);
                    resolve(el.href.match(/app_id=(\\d+)/)[1]);
                })()
            })
        `);
        const start = moment(startTime).format('YYYYMMDD');
        const end = moment(endTime).format('YYYYMMDD');

        const fetchListScript = `
            (function () {
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
                return fetchList();
            })();
        `;

        let viewList = await helper.executeJavaScript(fetchListScript);
        viewList = viewList.map(item => {
            return {
                view: Number(item.view_reader_num),
                day: moment(item.day, 'YYYYMMDD').format('YYYY-MM-DD')
            };
        });
        let {results: incomeList} = await helper.fetchJSON(`http://cep.baidu.com/api/js/reports?begin=${start}&end=${end}&timeGranularity=day&metrics=income`);
        incomeList = incomeList.map(item => {
            return {
                income: item.income,
                day: moment(item.time, 'YYYYMMDD').format('YYYY-MM-DD')
            };
        });

        return _.zipWith(viewList, incomeList, _.merge);
    }
}

