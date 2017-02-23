import fs from 'fs';
import path from 'path';
import {createCallApi} from 'middlewares/api';
import {createAction, createReducer} from 'redux-act';

import update from 'react/lib/update';

const HUSSIF = {};

let data = {};

try {
    data = JSON.parse(fs.readFileSync(path.resolve('.passport'), 'utf-8'));
    console.log(data);
} catch (err) {
    console.log(err, 'no token file');
}

const INITAL = {
    fetching: false,
    data: data
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
        fs.writeFile(path.resolve('.passport'), JSON.stringify(data));
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
    fs.writeFile(path.resolve('.passport'), '');
    return update(state, {
        data: {$set: {}}
    });
};

export default createReducer(HUSSIF, INITAL);
