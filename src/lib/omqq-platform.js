import Platform from './platform';

export default class OMQQPlatform extends Platform {
    loginUrl = 'https://om.qq.com/userAuth/index'
    publishUrl = 'https://om.qq.com/article/articlePublish'
    _login () {
        return new Promise((resolve, reject) => {
            const {webview, loginUrl, account, password} = this;
            webview.loadURL(loginUrl);

            const timer = setTimeout(() => {
                reject(new Error('timeout'));
            }, 10000);

            const didDomReady = async () => {
                const url = webview.getURL();
                // 登录界面
                if (url.startsWith(loginUrl)) {
                    this.executeJavaScript(`
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
                        const cookies = await this.getCookies();
                        const session = cookies.map(item => {
                            item.url = 'https://om.qq.com/';
                            return item;
                        });
                        const nickname = await this.executeJavaScript('document.querySelector(".header-login-inner .name").innerText;');
                        resolve({session, nickname});
                    } catch (err) {
                        reject(err);
                    } finally {
                        clearTimeout(timer);
                        webview.removeEventListener('dom-ready', didDomReady);
                    }
                }
            };
            webview.addEventListener('dom-ready', didDomReady);
        });
    }
    _isLogin () {
        return new Promise(async (resolve, reject) => {
            const {webview} = this;
            const checkUrl = 'https://om.qq.com/article/list?index=1&commentflag=0&source=0&relogin=1';
            webview.loadURL(checkUrl);

            const didDomReady = async () => {
                const url = webview.getURL(checkUrl);
                if (url.startsWith(checkUrl)) {
                    console.log(url);
                }
            };

            // try {
            //     const res = await this.getRresponse('https://om.qq.com/article/publish?relogin=1');
            //     const data = JSON.parse(res.body);
            //     resolve(data);
            // } catch (err) {
            //     reject(err);
            // } finally {
            //     webview.removeEventListener('dom-ready', didDomReady);
            // }

            webview.addEventListener('dom-ready', didDomReady);
        });
    }
    _publish (title, data) {
        return new Promise(async (resolve, reject) => {
            const {webview, publishUrl} = this;
            webview.loadURL(publishUrl);

            const didDomReady = async () => {
                const url = webview.getURL();
                if (url.startsWith(publishUrl)) {
                    this.injectPublishScript();
                }
            };

            try {
                const res = await this.getRresponse('https://om.qq.com/article/publish?relogin=1');
                const data = JSON.parse(res.body);
                resolve(data);
            } catch (err) {
                reject(err);
            } finally {
                webview.removeEventListener('dom-ready', didDomReady);
            }

            webview.addEventListener('dom-ready', didDomReady);
        });
    }

    injectPublishScript (title, {content}) {
        return this.executeJavaScript(`
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
}
