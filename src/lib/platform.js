import Events from 'events';
import _ from 'lodash';
import WebviewHelper from 'utils/webview-helper';

const container = document.createElement('div');
container.style.width = container.style.height = 0;
container.style.overflow = 'hidden';
document.body.appendChild(container);

const addWebviewToContainer = (webview, container) => {
    return new Promise(resolve => {
        const didDomReady = () => {
            webview.removeEventListener('dom-ready', didDomReady);
            resolve(webview);
        };
        webview.addEventListener('dom-ready', didDomReady);
        container.appendChild(webview);
    });
};

const autoLoginWithCookies = async (webview, cookies) => {
    const helper = new WebviewHelper(webview);
    if (cookies && cookies.length) {
        try {
            await helper.setCookies(cookies);
        } catch (err) {}
    }
};

export default class Platform extends Events {
    constructor (account, password, cookies, options = {}) {
        super();
        if (!account || !password) throw new Error('缺少用户名或密码');
        this.partition = `persist:${Date.now()}`;
        this.account = account;
        this.password = password;
        this.cookies = cookies;
        this._webviews = [];
        this.options = Object.assign({}, {
            container
        }, options);
    }
    async createWebview () {
        const webview = document.createElement('webview');
        webview.style.height = '100%';
        // document.body.innerHTML = '';
        webview.setAttribute('partition', this.partition);
        webview.setAttribute('src', 'about:blank');
        const container = typeof this.options.container === 'function'
            ? this.options.container()
            : this.options.container;
        await addWebviewToContainer(webview, container);
        return webview;
        // document.body.appendChild(webview);
        // this._readyPromise.then(() => {
        //     webview.openDevTools();
        // });
    }
    async getWebview () {
        // 0 未使用
        // 1 使用中
        const idle = _.remove(this._webviews, x => x.state === 0);
        const webview = idle.pop();
        this._webviews = this._webviews.concat(idle);
        const instance = webview ? webview.instance : await this.createWebview();
        this._webviews.push({
            state: 1,
            instance
        });
        return instance;
    }

    releaseWebview (instance) {
        return new Promise((resolve, reject) => {
            const webviews = this._webviews.filter(x => x.instance === instance);
            if (webviews.length !== 1) return reject(new Error('webviews 管理错误!'));
            const webview = webviews[0];
            const didDomReady = () => {
                instance.removeEventListener('dom-ready', didDomReady);
                webview.state = 0;
                resolve();
            };
            if (instance.parentElement === container) {
                webview.state = 0;
                return resolve();
            }
            addWebviewToContainer(instance, container).then(() => {
                instance.addEventListener('dom-ready', didDomReady);
                instance.loadURL('about:blank');
            }, reject);
        });
    }
    async login (container) {
        const webview = await this.getWebview();
        if (container) {
            await addWebviewToContainer(webview, container);
        }
        const result = await this._login(webview);
        await this.releaseWebview(webview);
        return result;
    }
    async isLogin (container) {
        const webview = await this.getWebview();
        await autoLoginWithCookies(webview, this.cookies);
        const result = await this._isLogin(webview);
        await this.releaseWebview(webview);
        return result;
    }
    async publish (title, data, container) {
        const webview = await this.getWebview();
        await autoLoginWithCookies(webview, this.cookies);
        const isLogin = await this.isLogin();
        if (!isLogin) {
            await this.login();
        }
        if (container) {
            await addWebviewToContainer(webview, container);
        }
        const result = await this._publish(webview, title, data);
        await this.releaseWebview(webview);
        return result;
    }
    async stats (startTime, endTime) {
        const webview = await this.getWebview();
        await autoLoginWithCookies(webview, this.cookies);
        const result = await this._stats(webview, startTime, endTime);
        await this.releaseWebview(webview);
        return result;
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
}
