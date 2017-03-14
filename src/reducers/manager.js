import {createAction, createReducer} from 'redux-act';

const HUSSIF = {};
const INITAL = {
    isAccountSelecting: false,
    isPlatformSelecting: false,
    content: null
};

export const login = createAction('LOGIN');
export const publish = createAction('PUBLISH');
export const selectPlatform = createAction('SELECT_PLATFORM');
export const selectAccount = createAction('SELECT_ACCOUNT');
export const loginComplete = createAction('LOGIN_COMPLETE');
export const publishComplete = createAction('PUBLISH_COMPLETE');

HUSSIF[login] = (state) => {
    return Object.assign({}, state, {isPlatformSelecting: true});
};
HUSSIF[publish] = (state, content) => {
    return Object.assign({}, state, {
        isAccountSelecting: true,
        content
    });
};

HUSSIF[selectPlatform] = (state) => {
    return Object.assign({}, state, {isPlatformSelecting: false});
};
HUSSIF[selectAccount] = (state) => {
    return Object.assign({}, state, {isAccountSelecting: false});
};

export default createReducer(HUSSIF, INITAL);
