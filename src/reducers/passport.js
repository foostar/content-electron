import fs from 'fs';
import path from 'path';
import {createCallApi} from 'middlewares/api';
import {createAction, createReducer} from 'redux-act';
import update from 'react/lib/update';

import {remote} from 'electron';

const app = remote.app;
const dataPath = path.join(app.getPath('appData'), 'xiaoyun', '.passport');
const datDir = path.join(app.getPath('appData'), 'xiaoyun');

const HUSSIF = {};

let data = {};

if (!fs.existsSync(datDir)) {
    fs.mkdirSync(datDir);
}

try {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
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
        fs.writeFile(dataPath, JSON.stringify(data));
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
    fs.writeFile(dataPath, '');
    return update(state, {
        data: {$set: {}}
    });
};

export default createReducer(HUSSIF, INITAL);
