import { makeAction, createReducer } from 'redux-act-async-api';
import update from 'react/lib/update';

const HUSSIF = {};
const INITAL = {
    fetching: false,
    data: []
};

export const signin = makeAction(HUSSIF, {
    type: 'SIGN_IN',
    endpoint: '/signin',
    method: 'POST',
    request: (state, payload) => update(state, {
        fetching: { $set: true }
    }),
    success: (state, payload) => update(state, {
        fetching: { $set: false },
        data: { $set: payload.result.data }
    }),
    failure: (state, payload) => update(state, {
        fetching: { $set: true }
    })
});

export default createReducer(HUSSIF, INITAL);
