export default class WebviewHelper {
    constructor (webview) {
        this.webview = webview;
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
                this.cookies = cookies;
                resolve(cookies);
            });
        });
    }
    async setCookies (cookies) {
        const actions = cookies.map((cookie) => new Promise((resolve, reject) => {
            this.webview.getWebContents().session.cookies.set(cookie, (err) => {
                if (err) return reject(err);
                resolve();
            });
        }));
        await Promise.all(actions);
        this.cookies = cookies;
    }
    dev () {
        this.webview.openDevTools();
    }
    fetchJSON (url) {
        url = url.trim();
        return new Promise(resolve => {
            const {webview} = this;
            const didDomReady = async () => {
                webview.openDevTools();
                const currentUrl = webview.getURL(url);
                if (currentUrl.startsWith(url)) {
                    const body = await this.executeJavaScript(`document.body.innerText`);
                    resolve(JSON.parse(body.trim()));
                }
            };
            webview.addEventListener('dom-ready', didDomReady);
            webview.loadURL(url);
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
