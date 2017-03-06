import Platform from './platform';
import WebviewHelper from 'utils/webview-helper';

export default class BaijiaPlatform extends Platform {
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
                        const res = await helper.getRresponse('https://om.qq.com/article/publish?relogin=1');
                        const data = JSON.parse(res.body);
                        resolve(data);
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
                console.log(el)
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
}
