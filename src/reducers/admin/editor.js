import {createCallApi} from 'middlewares/api';
import {createAction, createReducer} from 'redux-act';
import update from 'react/lib/update';

const HUSSIF = {};
const INITAL = {
    isFetching: false,
    content: '<p>请输入文章内容...</p>',
    title: '',
    category: 'other'
};
// 更新编辑器里的内容
export const updateModel = createAction('ADMIN_UPDATE_MODEL');

HUSSIF[ updateModel ] = (state, content) => {
    return Object.assign({}, state, {
        content
    });
};
// 文章详情
export const getArticle = createCallApi(HUSSIF, {
    type: 'ADMIN_GET_ARTICLE',
    endpoint: '/content',
    request: (state, payload) => update(state, {
        isFetching: {$set: true}
    }),
    success: (state, payload) => {
        const {data} = payload.result;
        return Object.assign({}, state, data, {
            isFetching: false
        });
    },
    failure: (state, payload) => update(state, {
        isFetching: {$set: false}
    })
});
// 修改文章
export const editArticle = createCallApi(HUSSIF, {
    type: 'ADMIN_EDITARTICLE',
    endpoint: '/content',
    method: 'PATCH',
    request: (state, payload) => update(state, {
        isFetching: {$set: true}
    }),
    success: (state, payload) => {
        const {data} = payload.result;
        return Object.assign({}, state, data, {
            isFetching: false
        });
    },
    failure: (state, payload) => update(state, {
        isFetching: {$set: false}
    })
});

export default createReducer(HUSSIF, INITAL);
