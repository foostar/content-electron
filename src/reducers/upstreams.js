import {createCallApi} from 'middlewares/api';
import {createReducer} from 'redux-act';
import update from 'react/lib/update';

const HUSSIF = {};
const INITAL = {
    fetching: false,
    skip: 0,
    count: 0,
    data: []
};

export const fetchUpstream = createCallApi(HUSSIF, {
    type: 'FETCH_UPSTREAM',
    endpoint: '/upstreams',
    method: 'GET',
    request: (state) => update(state, {
        fetching: {$set: true}
    }),
    success: (state, payload) => update(state, {
        fetching: {$set: false},
        data: {$apply: arr => {
            const idx = arr.findIndex(x => x.id === payload.result.data.id);
            arr[idx] = payload.result.data;
            return arr;
        }}
    }),
    failure: (state) => update(state, {
        fetching: {$set: true}
    })
});

export const fetchUpstreams = createCallApi(HUSSIF, {
    type: 'FETCH_UPSTREAMS',
    endpoint: '/upstreams',
    method: 'GET',
    request: (state) => update(state, {
        fetching: {$set: true}
    }),
    success: (state, payload) => update(state, {
        fetching: {$set: false},
        skip: {$set: payload.result.data.skip},
        count: {$set: payload.result.data.count},
        data: {$set: payload.result.data.upstreams}
    }),
    failure: (state) => update(state, {
        fetching: {$set: true}
    })
});

export const createUpstream = createCallApi(HUSSIF, {
    type: 'CREATE_UPSTREAM',
    endpoint: '/upstreams',
    method: 'POST',
    request: (state) => update(state, {
        fetching: {$set: true}
    }),
    success: (state) => update(state, {
        fetching: {$set: false}
    }),
    failure: (state) => update(state, {
        fetching: {$set: false}
    })
});

export const updateUpstream = createCallApi(HUSSIF, {
    type: 'UPDATE_UPSTREAM',
    endpoint: '/upstreams/:id',
    method: 'PATCH'
});

export default createReducer(HUSSIF, INITAL);

