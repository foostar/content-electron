export default class WebviewHelper {
    constructor (webview) {
        this.webview = webview;
    }
    appendTo (container) {
        const {webview} = this;
        if (webview.parentElement === container) {
            return Promise.resolve();
        }
        webview.__appending = true;
        return new Promise(resolve => {
            const didDomReady = () => {
                webview.removeEventListener('dom-ready', didDomReady);
                webview.__appending = false;
                resolve(webview);
            };
            webview.addEventListener('dom-ready', didDomReady);
            container.appendChild(webview);
        });
    }
    load (url, options) {
        const {webview} = this;
        return new Promise(resolve => {
            if (!webview.__appending) {
                webview.loadURL(url, options);
                return resolve();
            }
            const didDomReady = () => {
                webview.removeEventListener('dom-ready', didDomReady);
                webview.loadURL(url, options);
                resolve();
            };
            webview.addEventListener('dom-ready', didDomReady);
        });
    }
    executeJavaScript (script) {
        return new Promise(resolve => {
            this.webview.executeJavaScript(script, resolve);
        });
    }
    getCookies (opt = {}) {
        return new Promise((resolve, reject) => {
            this.webview.getWebContents().session.cookies.get(opt, (err, cookies) => {
                if (err) return reject(err);
                resolve(cookies);
            });
        });
    }
    clearCache () {
        return new Promise((resolve, reject) => {
            const session = this.webview.getWebContents().session;
            session.clearCache(() => {
                session.clearStorageData([], function () {
                    resolve();
                });
            });
        });
    }
    async setCookies (cookies) {
        const {session} = this.webview.getWebContents();
        const actions = cookies.map((cookie) => new Promise((resolve, reject) => {
            session.cookies.set(cookie, () => {
                resolve();
            });
        }));
        await Promise.all(actions);
    }
    dev () {
        this.webview.openDevTools();
    }
    fetchJSON (url) {
        url = url.trim();
        return new Promise(resolve => {
            const {webview} = this;
            const didDomReady = async () => {
                const currentUrl = webview.getURL(url);
                if (currentUrl.startsWith(url)) {
                    const body = await this.executeJavaScript(`document.body.innerText`);
                    resolve(JSON.parse(body.trim()));
                }
            };
            webview.addEventListener('dom-ready', didDomReady);
            this.load(url);
        });
    }
    getRresponse (url, optFn) {
        return new Promise((resolve, reject) => {
            const {webview} = this;
            if (!this._debugger) {
                const _debugger = this._debugger = webview.getWebContents().debugger;
                const callbacks = this._callbacks = [];
                _debugger.attach('1.1');
                _debugger.on('message', (event, method, data) => {
                    callbacks.forEach(fn => fn(event, method, data));
                });
                _debugger.sendCommand('Network.enable');
            }
            const _debugger = this._debugger;
            const fn = (event, method, {response, requestId, type}) => {
                if (method === 'Network.responseReceived' && type === 'XHR') {
                    if (typeof url === 'string' ? response.url !== url : !url(response)) return;
                    _debugger.sendCommand('Network.getResponseBody', {requestId}, (err, res) => {
                        if (this._callbacks.indexOf(fn) !== -1) {
                            this._callbacks.splice(this._callbacks.indexOf(fn), 1);
                        }
                        if (err && Object.keys(err).length) {
                            return reject(err);
                        }
                        if (optFn) {
                            optFn(res) && resolve(res);
                        } else {
                            resolve(res);
                        }
                    });
                }
            };
            this._callbacks.push(fn);
        });
    }
}
