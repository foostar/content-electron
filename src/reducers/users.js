import {createCallApi} from 'middlewares/api';
import {createReducer} from 'redux-act';
import update from 'react/lib/update';

const HUSSIF = {};
const INITAL = {
    fetching: false,
    data: []
};

// 获取用户列表
export const fetchUsers = createCallApi(HUSSIF, {
    type: 'FETCH_USERS',
    endpoint: '/users',
    method: 'GET',
    request: (state, payload) => update(state, {
        fetching: {$set: true}
    }),
    success: (state, payload) => update(state, {
        fetching: {$set: false},
        data: {$set: payload.result.data}
    }),
    failure: (state, payload) => update(state, {
        fetching: {$set: true}
    })
});

// 创建用户列表
export const createUser = createCallApi(HUSSIF, {
    type: 'CREATE_USER',
    endpoint: '/users',
    method: 'POST',
    request: (state, payload) => update(state, {
        fetching: {$set: true}
    }),
    success: (state, payload) => {
        console.log('crate user', payload.result);
        return state;
    },
    failure: (state, payload) => update(state, {
        fetching: {$set: true}
    })
});

export default createReducer(HUSSIF, INITAL);
