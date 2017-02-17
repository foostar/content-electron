import {createStore, applyMiddleware} from 'redux';

import reducers from 'reducers';
import config from 'config';

import errorMiddleware from 'middlewares/error';
import {apiMiddleware} from 'middlewares/api';
import {ipcMiddleware} from 'middlewares/ipc';

const {API_PREFIX} = config;

const middleware = [
    ipcMiddleware(),
    apiMiddleware({API_PREFIX}),
    errorMiddleware()
];

if (process.env.NODE_ENV !== 'production') {
    middleware.push(
        require('redux-logger')()
    );
}

const initState = {};

export default createStore(
    reducers,
    initState,
    applyMiddleware(...middleware)
);

