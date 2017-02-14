import {makeAction, createReducer} from 'middlewares/api';
// import {createAction} from 'redux-act';

import update from 'react/lib/update';

const HUSSIF = {};
const INITAL = {
    fetching: false,
    data: {

    }
};

export const fetchPlatforms = makeAction(HUSSIF, {
    type: 'FETCH_PLATFORMS',
    endpoint: '/platforms',
    method: 'GET',
    request: (state, payload) => update(state, {
        fetching: {$set: true}
    }),
    success: (state, payload) => {
        return update(state, {
            fetching: { $set: false },
            data: {$set: payload.result.data}
        });
    },
    failure: (state, payload) => update(state, {
        fetching: {$set: true}
    })
});

export default createReducer(HUSSIF, INITAL);
