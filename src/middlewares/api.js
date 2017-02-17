import { createAction } from 'redux-act';

export const CALL_API = Symbol('CALL_API');

export const apiMiddleware = (opt = {}) => store => next => async action => {
    if (!action[CALL_API]) return next(action);

    let {
        endpoint = '',
        method = 'GET',
        query,
        body,
        params,
        actions: [ request, success, failure ]
    } = action[CALL_API];

    const {
        API_PREFIX = '',
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    } = opt;

    try {
        headers['Authorization'] = 'Bearer ' + store.getState().passport.data.token;
    } catch (err) {}

    let url = '';

    if (params) {
        endpoint += `/${params}`;
    }

    if (typeof API_PREFIX === 'object') {
        const prefixKey = endpoint.split('/')[0];
        const prefixValue = API_PREFIX[prefixKey];
        if (prefixValue) {
            url = endpoint.replace(prefixKey, prefixValue);
        }
    } else {
        url = API_PREFIX + endpoint;
    }

    let payload = { body, query };
    let nextAction = failure;

    if (query) {
        url += Object.entries(query)
            .map(([k, v]) => `&${k}=${v}`)
            .join('')
            .replace(/^&/, '?');
    }

    if (method !== 'GET' && body) body = JSON.stringify(body);

    next(request());

    try {
        const res = await fetch(url, { headers, method, body });
        payload.result = await res.json();
        if (typeof opt.formatData === 'function') {
            payload.result = opt.formatData(payload.result);
        }
        if (res.ok) {
            if (typeof opt.isFailure === 'function' && opt.failure(payload.result)) {
                payload.error = true;
            } else {
                nextAction = success;
                payload.error = false;
            }
        } else {
            payload.error = true;
        }
    } catch (error) {
        payload.error = true;
        payload.result = { message: error.message };
    }
    return next(nextAction(payload));
};

export const makeAction = (HUSSIF, { type, endpoint, method, request, success, failure }) => {
    type = type.toUpperCase();
    const actions = [
        `${type}_REQUEST`,
        `${type}_SUCCESS`,
        `${type}_FAILURE`
    ].map(createAction);

    HUSSIF[ actions[0] ] = request;
    HUSSIF[ actions[1] ] = success;
    HUSSIF[ actions[2] ] = failure;

    return ({ body, query, params } = {}) => ({
        [CALL_API]: {
            endpoint,
            method,
            body,
            params,
            query,
            actions
        }
    });
};

export { createAction, createReducer } from 'redux-act';
