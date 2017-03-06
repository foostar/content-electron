import Events from 'events';
// let count = 0;

const container = document.createElement('div');
container.style.width = container.style.height = 0;
container.style.overflow = 'hidden';
document.body.appendChild(container);

export default class Platform extends Events {
    constructor (account, password, cookies) {
        super();
        if (!account || !password) throw new Error('缺少用户名或密码');

        this.account = account;
        this.password = password;
        this.cookies = cookies;
        this.partition = `persist:${Date.now()}`;

        const webview = this.webview = document.createElement('webview');

        webview.style.height = '100%';

        webview.setAttribute('src', 'about:blank');
        webview.setAttribute('partition', this.partition);

        this._readyPromise = new Promise(resolve => {
            webview.addEventListener('dom-ready', () => {
                // webview.openDevTools();
                this.cookies && this.setCookies(this.cookies);
                resolve();
            });
        });
        container.appendChild(webview);
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
        const actions = cookies.map(cookie => new Promise((resolve, reject) => {
            this.webview.getWebContents().session.cookies.set(cookie, (err) => {
                if (err) return reject(err);
                resolve();
            });
        }));
        await Promise.all(actions);
        this.cookies = cookies;
    }
    ready () {
        return this._readyPromise;
    }
    getRresponse (url) {
        return new Promise((resolve, reject) => {
            const {webview} = this;
            const webContents = webview.getWebContents();

            if (webContents.isDevToolsOpened()) {
                return reject('Dev tools has opended');
            }
            let _debugger;

            if (this._debugger) {
                _debugger = this._debugger;
            } else {
                this._debugger = _debugger = webContents.debugger;
                this._debugger.attach('1.1');
            }
            _debugger.on('message', (event, method, params) => {
                const {response, requestId, type} = params;
                if (method === 'Network.responseReceived' && type === 'XHR') {
                    if (typeof url === 'string' ? response.url !== url : !url(response)) return;
                    _debugger.sendCommand('Network.getResponseBody', {requestId}, (err, res) => {
                        if (err) {
                            console.info('Network.getResponseBody', err);
                        }
                        resolve(res);
                    });
                }
            });
            _debugger.sendCommand('Network.enable');
        });
    }
    async login () {
        await this.ready();
        return this._login();
    }
    async isLogin () {
        await this.ready();
        return this._isLogin();
    }
    async publish (title, data) {
        await this.ready();
        return this._publish(title, data);
    }
    async stats () {
        await this.ready();
        return this._stats();
    }
    _login () {
        throw new Error('请重写_login方法！');
    }
    _isLogin () {
        throw new Error('请重写_isLogin方法！');
    }
    _publish () {
        throw new Error('请重写_publish方法！');
    }
    _stats () {
        throw new Error('请重写_stats方法！');
    }
    executeJavaScript (script) {
        return new Promise(resolve => {
            this.webview.executeJavaScript(script, resolve);
        });
    }
}
