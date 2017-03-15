import {createCallApi} from 'middlewares/api';
import {createAction, createReducer} from 'redux-act';
import update from 'react/lib/update';
import moment from 'moment';

const HUSSIF = {};
const INITAL = {
    isFetching: false,
    count: 50,
    skip: 0,
    contents: []
};

// 改变页数
export const pageChange = createAction('PAGECHANGE');
HUSSIF[ pageChange ] = (state, skip) => {
    return Object.assign({}, state, {
        skip
    });
};

// 获取文章列表
export const getContents = createCallApi(HUSSIF, {
    type: 'GET_CONTENTS',
    endpoint: '/contents',
    method: 'GET',
    request: (state, payload) => update(state, {
        isFetching: {$set: true}
    }),
    success: (state, payload) => {
        const {data} = payload.result;
        data.contents.forEach((v) => {
            v.key = v.id;
            v.createdAt = moment(v.createdAt).format('YYYY-MM-DD');
        });
        return Object.assign({}, state, data, {
            isFetching: false
        });
    },
    failure: (state, payload) => update(state, {
        isFetching: {$set: true}
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
    type: 'GET_CONTENT',
    endpoint: '/contents'
});

// 修改文章
export const updateContent = createCallApi(HUSSIF, {
    type: 'UPDATE_CONTENT',
    endpoint: '/contents',
    method: 'PATCH'
});

export default createReducer(HUSSIF, INITAL);
