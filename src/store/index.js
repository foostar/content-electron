import {createStore, applyMiddleware} from 'redux';
import {apiMiddleware} from 'redux-act-async-api';
import {notification} from 'antd';

import reducers from 'reducers';

import config from 'config';

const {API_PREFIX} = config;

const errorMiddleware = store => next => async action => {
    if (action.payload && action.payload.error) {
        let description = '未知错误';
        let show = true;
        try {
            console.log(action.payload.result.status);
            const {message, code} = action.payload.result.status;
            description = `[${code}]: ${message}`;
        } catch (err) {}

        show && notification.error({
            message: '错误',
            description
        });
    }
    delete action.error;
    return next(action);
};

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

