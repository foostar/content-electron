import {createCallApi} from 'middlewares/api';
import {createReducer} from 'redux-act';
import update from 'react/lib/update';

const HUSSIF = {};
const INITAL = {
    fetching: false,
    count: 50,
    skip: 0,
    data: []
};

// 获取文章列表
export const getContents = createCallApi(HUSSIF, {
    type: 'GET_CONTENTS',
    endpoint: '/contents',
    method: 'GET',
    request: (state, payload) => update(state, {
        fetching: {$set: true}
    }),
    success: (state, payload) => update(state, {
        data: {$set: payload.result.data.contents},
        skip: {$set: payload.result.data.skip},
        count: {$set: payload.result.data.count},
        fetching: {$set: false}
    }),
    failure: (state, payload) => update(state, {
        fetching: {$set: false}
    })
});

// 新增文章
export const addContent = createCallApi(HUSSIF, {
    type: 'ADD_CONTENT',
    endpoint: '/contents',
    method: 'POST'
});

// 获取文章详情
export const getContent = createCallApi(HUSSIF, {
    type: 'ADMIN_GET_CONTENT',
    endpoint: '/contents'
});

// 修改文章
export const updateContent = createCallApi(HUSSIF, {
    type: 'UPDATE_CONTENT',
    endpoint: '/contents',
    method: 'PATCH'
});

export default createReducer(HUSSIF, INITAL);
