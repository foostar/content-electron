import {createStore, applyMiddleware} from 'redux';
import {apiMiddleware} from 'middleware/api';

import reducers from 'reducers';

import config from 'config';

const {API_PREFIX} = config;
import errorMiddleware from 'middleware/error';

const middleware = [
    apiMiddleware({API_PREFIX}),
    errorMiddleware
];

if (process.env.NODE_ENV !== 'production') {
    middleware.push(
        require('redux-logger')()
    );
}

export default (initState = {}) => createStore(
    reducers,
    initState,
    applyMiddleware(...middleware)
);

