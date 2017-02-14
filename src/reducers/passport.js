import {makeAction, createReducer} from 'middleware/api';
import {createAction} from 'redux-act';

import update from 'react/lib/update';

const HUSSIF = {};
const INITAL = {
    fetching: false,
    data: {
        token: localStorage.getItem('token')
    }
};

export const signin = makeAction(HUSSIF, {
    type: 'SIGN_IN',
    endpoint: '/signin',
    method: 'POST',
    request: (state, payload) => update(state, {
        fetching: {$set: true}
    }),
    success: (state, payload) => {
        const {data} = payload.result;
        localStorage.setItem('token', data.token);
        return update(state, {
            fetching: { $set: false },
            data: {$set: payload.result.data}
        });
    },
    failure: (state, payload) => update(state, {
        fetching: {$set: true}
    })
});

export const signout = createAction('SIGN_OUT');

HUSSIF[signout] = (state) => {
    localStorage.clear();
    return update(state, {
        data: {$set: {}}
    });
};

export default createReducer(HUSSIF, INITAL);
