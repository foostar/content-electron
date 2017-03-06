import {createCallApi} from 'middlewares/api';
import {createReducer} from 'redux-act';
import update from 'react/lib/update';

const HUSSIF = {};
const INITAL = {
    fetching: false,
    upstream: {},
    redactor: {}
};

export const fetchStatGroupByUpstream = createCallApi(HUSSIF, {
    type: 'FETCH_STAT_BY_UPSTREAM',
    endpoint: '/reproduction/stat?groupBy=upstream',
    request: (state) => update(state, {
        fetching: {$set: true}
    }),
    success: (state, payload) => {
        return update(state, {
            fetching: {$set: false},
            upstream: {$apply: () => {
                const ups = {};
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

export const fetchStatGroupByRedactor = createCallApi(HUSSIF, {
    type: 'FETCH_STAT_BY_READACTOR',
    endpoint: '/reproduction/stat?groupBy=publisher',
    request: (state) => update(state, {
        fetching: {$set: true}
    }),
    success: (state, payload) => {
        return update(state, {
            fetching: {$set: false},
            redactor: {
                $apply: () => {
                    const radactor = {};
                    payload.result.data.filter(r => r.publisher).map(item => {
                        radactor[item.publisher] = item;
                    });
                    return radactor;
                }
            }
        });
    },
    failure: (state) => update(state, {
        fetching: {$set: false}
    })
});

export const fetchStat = createCallApi(HUSSIF, {
    type: 'FETCH_STAT_WITH_UPSTREAM',
    endpoint: '/reproduction/stat'
});

export const upsert = createCallApi(HUSSIF, {
    type: 'UPSERT_REPRODUCTION',
    endpoint: '/reproduction/',
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
    endpoint: '/reproduction/batch',
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
