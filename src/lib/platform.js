import Events from 'events';
import _ from 'lodash';
import WebviewHelper from 'utils/webview-helper';
import store from 'store';
import {updateUpstream} from 'reducers/upstreams';
import DataCache, {DiskStore} from './datacache';

const container = document.createElement('div');
container.style.width = container.style.height = 0;
container.style.overflow = 'hidden';
document.body.appendChild(container);

const dataCaches = {};
const webviews = [];

const autoLoginWithCookies = async (webview, cookies) => {
    const helper = new WebviewHelper(webview);
    if (cookies && cookies.length) {
        try {
            await helper.setCookies(cookies);
        } catch (err) {}
    }
};

export default class Platform extends Events {
    constructor ({account, password, session: cookies, id}, options = {}) {
        super();
        if (!account || !password) throw new Error('缺少用户名或密码');
        // this.partition = `persist:${id}`;
        // this.partition = `persist:${Date.now()}`;
        this.id = id;
        this.account = account;
        this.password = password;
        this.cookies = cookies;
        this.dataCache = dataCaches[id] = dataCaches[id] || new DataCache({
            store: new DiskStore()
        });
        this.tasks = [];
        this.options = Object.assign({}, {
            container
        }, options);
        this.addListener('task-start', task => {
            this.emit(task.name, task.webview);
            this.emit('tasks-update', task, 'start', this.tasks);
        });
        this.addListener('task-complete', task => {
            this.emit(task.name, task.webview);
            this.emit('tasks-update', task, 'complete', this.tasks);
        });
    }
    async createWebview () {
        const webview = document.createElement('webview');
        const helper = new WebviewHelper(webview);
        webview.style.height = webview.style.width = '100%';
        // document.body.innerHTML = '';
        webview.setAttribute('partition', _.uniqueId('persist:'));
        webview.setAttribute('src', 'about:blank');
        const container = typeof this.options.container === 'function'
            ? this.options.container()
            : this.options.container;
        await helper.appendTo(container);
        return webview;
        // document.body.appendChild(webview);
        // this._readyPromise.then(() => {
        //     webview.openDevTools();
        // });
    }
    async getWebview () {
        // 0 未使用
        // 1 使用中
        const idle = _.remove(webviews, x => x.state === 0);
        const webview = idle.pop();
        idle.forEach(x => {
            webviews.push(x);
        });
        const instance = webview ? webview.instance : await this.createWebview();
        webviews.push({
            state: 1,
            instance
        });
        // 如果webview池，partition无法重新设置
        // instance.setAttribute('partition', this.partition);
        const helper = new WebviewHelper(instance);
        await helper.clearCache();
        return instance;
    }

    updateCookies (cookies) {
        this.cookies = cookies;
        store.dispatch(updateUpstream({
            params: {id: this.id},
            body: {session: cookies}
        }));
    }

    releaseWebview (instance) {
        return new Promise((resolve, reject) => {
            const wvs = webviews.filter(x => x.instance === instance);
            if (wvs.length !== 1) return reject(new Error('webviews 管理错误!'));
            const webview = wvs[0];
            const complete = () => {
                webview.state = 0;
                resolve();
            };
            const didDomReady = () => {
                instance.removeEventListener('dom-ready', didDomReady);
                complete();
            };
            if (instance.parentElement === container) {
                return complete();
            }
            const helper = new WebviewHelper(instance);
            helper.appendTo(container).then(() => {
                instance.addEventListener('dom-ready', didDomReady);
                instance.loadURL('about:blank');
            }, reject);
        });
    }
    addTask (name, webview) {
        const {tasks} = this;
        const task = {
            id: _.uniqueId('task_'),
            name,
            webview
        };
        tasks.push(task);
        this.emit('task-start', task);
        return () => {
            _.remove(tasks, task);
            this.emit('task-complete', task);
        };
    }
    async login (container) {
        const webview = await this.getWebview();
        const helper = new WebviewHelper(webview);
        if (container) {
            await helper.appendTo(container);
        }
        const onComplete = this.addTask('login', webview);
        const result = await this._login(webview);
        onComplete();
        await this.releaseWebview(webview);
        return result;
    }
    async isLogin () {
        if (Date.now() - this._lastCheck < 1000 * 60 * 5) {
            return true;
        }
        const webview = await this.getWebview();
        await autoLoginWithCookies(webview, this.cookies);
        const onComplete = this.addTask('check-login', webview);
        const result = await this._isLogin(webview);
        await this.releaseWebview(webview);
        onComplete();
        if (result) {
            this._lastCheck = Date.now();
        }
        return result;
    }
    async publish (title, data, container) {
        const webview = await this.getWebview();
        const helper = new WebviewHelper(webview);
        await autoLoginWithCookies(webview, this.cookies);
        const isLogin = await this.isLogin();
        if (!isLogin) {
            const {session} = await this.login();
            this.updateCookies(session);
        }
        if (container) {
            await helper.appendTo(container);
        }
        const onComplete = this.addTask('publish', webview);
        const result = await this._publish(webview, title, data);
        onComplete();
        await this.releaseWebview(webview);
        return result;
    }
    async statByContent () {
        const webview = await this.getWebview();
        await autoLoginWithCookies(webview, this.cookies);
        const isLogin = await this.isLogin();
        if (!isLogin) {
            const {session} = await this.login();
            this.updateCookies(session);
        }
        const onComplete = this.addTask('stat-by-content', webview);
        const result = await this._statByConent(webview);
        onComplete();
        await this.releaseWebview(webview);
        return result;
    }
    statByUpstream (startTime, endTime) {
        const key = JSON.stringify({
            startTime,
            endTime,
            id: this.id
        });
        return this.dataCache.get(key, {
            sync: 2,
            expires: 1000 * 60 * 60 * 6,
            force: true
        }, (k) => {
            const data = JSON.parse(k);
            return this.__statByUpstream(data.startTime, data.endTime);
        });
    }
    async __statByUpstream (startTime, endTime) {
        const webview = await this.getWebview();
        await autoLoginWithCookies(webview, this.cookies);
        const isLogin = await this.isLogin();
        if (!isLogin) {
            const {session} = await this.login();
            this.updateCookies(session);
        }
        const onComplete = this.addTask('stat-by-upstream', webview);
        const result = await this._statByUpstream(webview, startTime, endTime);
        onComplete();
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
    _statByContent () {
        throw new Error('请重写_statByConent方法！');
    }
    _statByUpstream () {
        throw new Error('请重写statByUpstream方法！');
    }
}
