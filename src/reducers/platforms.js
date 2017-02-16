/* 发文平台
 *      platform
 *        |- 企鹅
 *        |    |- account 1
 *        |    `- account 2
 *        `- 百家
 *             |- account 1
 *             |- account 2
 *             `- account 3
 */

import {createCallApi} from 'middlewares/api';
import {createCallIpc} from 'middlewares/ipc';

import {
    // createAction,
    createReducer
} from 'redux-act';

import update from 'react/lib/update';

const HUSSIF = {};
const INITAL = {
    fetching: false,
    data: [],
    platforms: {
        // '企鹅号': {
        //     accounts: ['330465659@qq.com']
        // },
        // '百家号': {
        //     accounts: []
        // }
    },
    accounts: {
        // '330465659@qq.com': {
        //     cookies: []
        // }
    }
};

export const getCookiesByPartition = createCallIpc(HUSSIF, {
    channel: 'GET_COOKIES_BY_PARTITION'
});

export const setPartitionCookies = createCallIpc(HUSSIF, {
    channel: 'SET_PARTITION_COOKIES'
});

export const fetchPlatforms = createCallApi(HUSSIF, {
    type: 'FETCH_PLATFORMS',
    endpoint: '/platforms',
    method: 'GET',
    request: (state) => update(state, {
        fetching: {$set: true}
    }),
    success: (state, payload) => {
        return update(state, {
            fetching: {$set: false},
            data: {$set: payload.result.data}
        });
    },
    failure: (state) => update(state, {
        fetching: {$set: true}
    })
});

export default createReducer(HUSSIF, INITAL);

