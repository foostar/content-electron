import fs from 'fs';
import path from 'path';
import {createCallApi} from 'middlewares/api';
import {createAction, createReducer} from 'redux-act';

import update from 'react/lib/update';

const HUSSIF = {};

let token;
try {
    token = fs.readFileSync(path.resolve('.token'), 'utf-8');
    console.log(token);
} catch (err) {
    console.log(err, 'no token file');
}

const INITAL = {
    fetching: false,
    data: {
        // token: localStorage.getItem('token')
        token
    }
};

export const signin = createCallApi(HUSSIF, {
    type: 'SIGN_IN',
    endpoint: '/signin',
    method: 'POST',
    request: (state, payload) => update(state, {
        fetching: {$set: true}
    }),
    success: (state, payload) => {
        const {data} = payload.result;
        localStorage.setItem('token', data.token);
        fs.writeFile(path.resolve('.token'), data.token);
        return update(state, {
            fetching: {$set: false},
            data: {$set: data}
        });
    },
    failure: (state, payload) => update(state, {
        fetching: {$set: true}
    })
});

export const signout = createAction('SIGN_OUT');

HUSSIF[signout] = (state) => {
    fs.writeFile(path.resolve('.token'), '');
    localStorage.clear();
    return update(state, {
        data: {$set: {}}
    });
};

export default createReducer(HUSSIF, INITAL);
