import _ from 'lodash';
import path from 'path';
import fs from 'fs';

import {remote} from 'electron';

const app = remote.app;

class DiskStore {
    constructor () {
        const fileDir = path.join(app.getPath('appData'), 'xiaoyun');
        this.filePath = path.join(app.getPath('appData'), 'xiaoyun', 'cache.json');
        if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir);
        }
    }
    _getStore () {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(this.filePath)) {
                return resolve({});
            }
            fs.readFile(this.filePath, 'utf-8', (err, data) => {
                if (err) return reject(err);
                return resolve(JSON.parse(data));
            });
        });
    }
    _setStore (store) {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.filePath, JSON.stringify(store), (err) => {
                if (err) return reject(err);
                return resolve();
            });
        });
    }
    async get (id) {
        const store = await this._getStore();
        return store[id];
    }
    async set (id, data) {
        const store = await this._getStore();
        store[id] = data;
        return this._setStore(store);
    }
    async del (id) {
        const store = await this._getStore();
        delete store[id];
        return this._setStore(store);
    }
}

class MemoryStore {
    constructor () {
        this.data = {};
    }
    get (id) {
        return Promise.resolve(this.data[ id ]);
    }
    set (id, data) {
        this.data[ id ] = data;
        return Promise.resolve();
    }
    del (id) {
        delete this.data[ id ];
        return Promise.resolve();
    }
}

class RadisStore {
    constructor (client) {
        this.client = client;
    }
    get (id) {
        return new Promise((resolve, reject) => {
            this.client.get(id, (err, data) => {
                if (err) return reject(err);
                resolve(JSON.parse(data));
            });
        });
    }
    set (id, data) {
        return new Promise((resolve, reject) => {
            this.client.setex(id, 30 * 60, JSON.stringify(data), err => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
    del (id) {
        return new Promise((resolve, reject) => {
            this.client.del(id, err => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
}

const requests = {};

const defaultExpires = 5 * 60 * 1000;

class DataCache {
    constructor ({store = new MemoryStore()} = {}) {
        this.store = store;
        this.caches = {};
    }

/*
    options: {
        expires: 100, // ms
        sync: -1: 直接请求 0: 取缓存 1: 每次更新 2: 过期更新
        force: true,
    }
*/

    async get (id, {sync, force, expires} = {}, fetch) {
        const fetchData = oid => {
            const promise = requests[ oid ] = requests[ oid ] || fetch(oid);
            promise.then(() => {
                delete requests[ oid ];
            }, () => {
                delete requests[ oid ];
            });
            return promise;
        };
        const store = this.store;
        sync = sync || 0;
        expires = defaultExpires;
        const options = {
            sync,
            force,
            expires
        };
        let data = null;
        let newData;
        let storeData;
        switch (sync) {
            case -1: // 直接请求
                data = await fetchData(id);
                this.set(id, data, options);
                return data;
            case 0: // 取缓存 过期后返回 null
                storeData = await store.get(id);
                if (storeData && storeData.expired > Date.now()) {
                    data = storeData.raw;
                }
                if (data) return data;
                if (force) {
                    data = await fetchData(id);
                    await this.set(id, data, options);
                }
                return data;
            case 1: // 取缓存 每次更新
                storeData = await store.get(id);
                if (storeData) {
                    data = storeData.raw;
                }
                newData = fetchData(id);
                if (!data && force) {
                    data = await newData;
                    await this.set(id, data, options);
                } else {
                    this.set(id, newData, options);
                }
                return data;
            case 2: // 取缓存 过期更新
                storeData = await store.get(id);
                if (storeData) {
                    data = storeData.raw;
                    if (storeData.expired <= Date.now()) {
                        newData = fetchData(id);
                    }
                }
                if (!data && force) {
                    data = await newData || fetchData(id);
                    await this.set(id, data, options);
                } else if (newData) {
                    this.set(id, newData, options);
                }
                return data;
            default:
                return null;
        }
    }

    async set (id, data, {expires} = {}) {
        if (data instanceof Promise) {
            try {
                data = await data;
            } catch (err) {
                // 过期时间延长1分钟
                // const storeData = await this.store.get(id)
                // if (!storeData) return null
                // storeData.expired = storeData.expired + 1000 * 60
                return this.store.del(id);
            }
        }
        expires = _.isNil(expires) ? defaultExpires : expires;
        return this.store.set(id, {
            expired: Date.now() + expires,
            raw: data
        });
    }

    async del (id) {
        return this.store.del(id);
    }
}

export {MemoryStore, RadisStore, DiskStore};
export default DataCache;
