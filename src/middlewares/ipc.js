import {ipcRenderer} from 'electron';
import {createAction} from 'redux-act';

export const CALL_IPC = Symbol('CALL_IPC');

// channel 是否要设置成路由模式?

export const ipcMiddleware = (opt = {}) => store => next => async action => {
    if (!action[CALL_IPC]) return next(action);

    const {
        channel,
        data,
        actions: [request, success, failure]
    } = action[CALL_IPC];

    next(request());
    const result = ipcRenderer.sendSync(channel, data);
    if (result.error) {
        return next(failure(result));
    }
    return next(success(result));
};

export const createCallIpc = (HUSSIF, {channel, request, success, failure}) => {
    channel = channel.toUpperCase();

    const actions = [
        `${channel}_REQUEST`,
        `${channel}_SUCCESS`,
        `${channel}_FAILURE`
    ].map(createAction);

    HUSSIF[actions[0]] = request || (state => state);
    HUSSIF[actions[1]] = success || (state => state);
    HUSSIF[actions[2]] = failure || (state => state);

    return (data) => ({
        [CALL_IPC]: {
            channel,
            data,
            actions
        }
    });
};
