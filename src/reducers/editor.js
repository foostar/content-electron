import {makeAction, createReducer} from 'middlewares/api';
import { createAction } from 'redux-act';
import update from 'react/lib/update';

const HUSSIF = {};
const INITAL = {
    isFetching: false,
    content: '<p>请输入文章内容...</p>',
    title: '',
    category: 'other'
};
// 更新编辑器里的内容
export const updateModel = createAction('UPDATE_MODEL');
// 强制loading
export const fetching = createAction('FETCHING');

HUSSIF[ updateModel ] = (state, content) => {
    return Object.assign({}, state, {
        content
    });
};

HUSSIF[ fetching ] = (state) => {
    return Object.assign({}, state, {
        isFetching: true
    });
};
// 新增文章
export const addArticle = makeAction(HUSSIF, {
    type: 'ADDARTICLE',
    endpoint: '/content',
    method: 'POST',
    request: (state, payload) => update(state, {
        isFetching: { $set: true }
    }),
    success: (state, payload) => INITAL,
    failure: (state, payload) => update(state, {
        isFetching: { $set: true }
    })
});
// 文章详情
export const getArticle = makeAction(HUSSIF, {
    type: 'GETARTICLE',
    endpoint: '/content',
    request: (state, payload) => update(state, {
        isFetching: { $set: true }
    }),
    success: (state, payload) => {
        const {data} = payload.result;
        return Object.assign({}, state, data, {
            isFetching: false
        });
    },
    failure: (state, payload) => update(state, {
        isFetching: { $set: true }
    })
});
// 修改文章
export const editArticle = makeAction(HUSSIF, {
    type: 'EDITARTICLE',
    endpoint: '/content',
    method: 'PATCH',
    request: (state, payload) => update(state, {
        isFetching: { $set: true }
    }),
    success: (state, payload) => {
        const {data} = payload.result;
        return Object.assign({}, state, data, {
            isFetching: false
        });
    },
    failure: (state, payload) => update(state, {
        isFetching: { $set: false }
    })
});

export default createReducer(HUSSIF, INITAL);
