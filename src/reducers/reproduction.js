import {createCallApi} from 'middlewares/api';
import {createReducer} from 'redux-act';
import update from 'react/lib/update';

const HUSSIF = {};
const INITAL = {
    feching: false,
    upstream: {}
};

export const fetchStat = createCallApi(HUSSIF, {
    type: 'FETCH_STAT_BY_UPSTREAM',
    endpoint: '/reproduction/stat?groupBy=upstream',
    request: (state) => update(state, {
        fetching: {$set: true}
    }),
    success: (state, payload) => {
        return update(state, {
            fetching: {$set: false},
            upstream: {$apply: ups => {
                payload.result.data.forEach(item => {
                    ups[item.upstream] = item;
                });
                return ups;
            }}
        });
    },
    failure: (state) => update(state, {
        fetching: {$set: false}
    })
});

export const fetchStatWithUpstreams = createCallApi(HUSSIF, {
    type: 'FETCH_STAT_WITH_UPSTREAM',
    endpoint: '/reproduction/stat'
});

export const upsert = createCallApi(HUSSIF, {
    type: 'UPSERT_REPRODUCTION',
    endpoint: '/reproduction/:id',
    method: 'POST',
    request: (state) => update(state, {
        fetching: {$set: true}
    }),
    success: (state, payload) => {
        return update(state, {
            fetching: {$set: false}
        });
    },
    failure: (state) => update(state, {
        fetching: {$set: false}
    })
});

export const updateMany = createCallApi(HUSSIF, {
    type: 'UPDATE_REPRODUCTION',
    endpoint: '/reproduction/update',
    method: 'POST',
    request: (state) => update(state, {
        fetching: {$set: true}
    }),
    success: (state, payload) => {
        return update(state, {
            fetching: {$set: false}
        });
    },
    failure: (state) => update(state, {
        fetching: {$set: false}
    })
});

export default createReducer(HUSSIF, INITAL);
