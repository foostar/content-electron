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
const helpers = [];

export default class Platform extends Events {
    constructor ({account, password, session: cookies, id}, options = {}) {
        super();
        if (!account || !password) throw new Error('缺少用户名或密码');
        this.id = id;
        this.account = account;
        this.password = password;
        this.cookies = cookies || [];
        this.dataCache = dataCaches[id] = dataCaches[id] || new DataCache({
            store: new DiskStore()
        });
        this.tasks = [];
        this.options = Object.assign({}, {
            container
        }, options);
        this.addListener('task-start', task => {
            this.emit(`${task.name}:start`, task.webview);
            this.emit('tasks-update', task, 'start', this.tasks);
        });
        this.addListener('task-success', task => {
            this.emit(`${task.name}-success`, task.webview);
            this.emit('tasks-update', task, 'success', this.tasks);
        });
        this.addListener('task-error', (task, err) => {
            this.emit(`${task.name}-error`, task.webview);
            this.emit('tasks-update', task, 'error', this.tasks, err);
        });
        this.addListener('task-complete', task => {
            this.emit(`${task.name}-complete`, task.webview);
            this.emit('tasks-update', task, 'complete', this.tasks);
        });
    }
    async createWebviewHelper () {
        const webview = document.createElement('webview');
        webview.style.height = webview.style.width = '100%';
        webview.setAttribute('partition', `persist:${this.id}`);
        webview.setAttribute('src', 'about:blank');
        const helper = new WebviewHelper(webview);
        helper.id = this.id;
        await helper.appendTo(container);
        return helper;
    }
    async getWebviewHelper () {
        const index = _.findIndex(helpers, {id: this.id});
        const helper = index !== -1 ? _.remove(helpers, (x, i) => i === index)[0] : await this.createWebviewHelper();
        await helper.clearCache();
        await helper.setCookies(this.cookies);
        return helper;
    }
    async releaseWebviewHelper (helper) {
        await helper.load('about:blank');
        await helper.appendTo(container);
        await helper.clearCache();
        helpers.push(helper);
    }
    updateCookies (cookies) {
        return store.dispatch(updateUpstream({
            params: {id: this.id},
            body: {session: cookies}
        }));
    }
    async addTask (name, fn) {
        const {tasks} = this;
        const helper = await this.getWebviewHelper();
        const task = {
            id: _.uniqueId('task_'),
            name,
            helper,
            webview: helper.webview,
            complete: async () => {
                if (task._complete) return;
                task._complete = true;
                await this.releaseWebviewHelper(helper);
                _.remove(tasks, task);
                this.emit('task-complete', task);
            }
        };
        tasks.push(task);
        this.emit('task-start', task);
        let result;
        let error;
        try {
            result = await fn(helper);
        } catch (err) {
            error = err;
        }
        await task.complete();
        if (error) {
            this.emit('task-error', task, error);
            return Promise.reject(error);
        }
        this.emit('task-success', task);
        return result;
    }
    async login (container) {
        return this.addTask('login', async helper => {
            if (container) {
                await helper.appendTo(container);
            }
            return this._login(helper.webview);
        });
    }
    async isLogin () {
        return await this.addTask('check-login', helper => this._isLogin(helper.webview));
    }
    async autoLogin () {
        const isLogin = await this.isLogin();
        if (!isLogin) {
            const {session} = await this.login();
            this.cookies = JSON.parse(JSON.stringify(session));
            this.updateCookies(session);
        }
    }
    async publish (title, data) {
        await this.autoLogin();
        return this.addTask('publish', helper => this._publish(helper.webview, title, data));
    }
    async statByContent () {
        await this.autoLogin();
        return this.addTask('stat-by-content', helper => this._statByConent(helper.webview));
    }
    async getPushlistState () {
        await this.autoLogin();
        return this.addTask('get-publish-state', helper => this._getPushlistState(helper.webview));
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
        await this.autoLogin();
        return this.addTask('stat-by-upstream', helper => this._statByUpstream(helper.webview, startTime, endTime));
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
