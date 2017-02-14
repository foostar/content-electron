import {createStore, applyMiddleware} from 'redux';
import {apiMiddleware} from 'redux-act-async-api';

import reducers from 'reducers';

import {API_PREFIX} from 'config';

const middleware = [
    apiMiddleware({API_PREFIX})
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
