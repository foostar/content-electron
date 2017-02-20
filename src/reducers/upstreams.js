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
    data: {}
};

export const getCookiesByPartition = createCallIpc(HUSSIF, {
    channel: 'GET_COOKIES_BY_PARTITION'
});

export const setPartitionCookies = createCallIpc(HUSSIF, {
    channel: 'SET_PARTITION_COOKIES'
});

export const fetchUpstreams = createCallApi(HUSSIF, {
    type: 'FETCH_UPSTREAMS',
    endpoint: '/upstream',
    method: 'GET',
    request: (state) => update(state, {
        fetching: {$set: true}
    }),
    success: (state, payload) => {
        console.log('fetch upstream', payload.result.data);
        return update(state, {
            fetching: {$set: false},
            data: {$set: payload.result.data}
        });
    },
    failure: (state) => update(state, {
        fetching: {$set: true}
    })
});

export const createUpstream = createCallApi(HUSSIF, {
    type: 'CREATE_UPSTREAM',
    endpoint: '/upstream',
    method: 'POST',
    request: (state) => update(state, {
        fetching: {$set: true}
    }),
    success: (state, payload) => {
        console.log('create upstream', payload);
        return update(state, {
            fetching: {$set: false}
        });
    },
    failure: (state, payload) => update(state, {
        fetching: {$set: false}
    })
});

export default createReducer(HUSSIF, INITAL);

