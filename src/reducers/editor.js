import {createCallApi} from 'middlewares/api';
import {createAction, createReducer} from 'redux-act';
import update from 'react/lib/update';

const HUSSIF = {};
const INITAL = {
    isFetching: false,
    content: '',
    title: '',
    category: 'other'
};
// 更新编辑器里的内容
export const updateModel = createAction('UPDATE_MODEL');
// 强制loading
export const fetching = createAction('FETCHING');
// 清空表单
export const clearArticle = createAction('CLEARARTICLE');

HUSSIF[ updateModel ] = (state, content) => {
    return Object.assign({}, state, {
        content
    });
};

HUSSIF[ fetching ] = (state, isFetching) => {
    if (isFetching == false) {
        isFetching = false;
    } else {
        isFetching = true;
    }
    return Object.assign({}, state, {
        isFetching
    });
};

HUSSIF[ clearArticle ] = (state, content) => {
    return Object.assign({}, state, INITAL);
};

// 新增文章
export const addArticle = createCallApi(HUSSIF, {
    type: 'ADDARTICLE',
    endpoint: '/content',
    method: 'POST',
    request: (state, payload) => update(state, {
        isFetching: {$set: true}
    }),
    success: (state, payload) => INITAL,
    failure: (state, payload) => update(state, {
        isFetching: {$set: false}
    })
});
// 文章详情
export const getArticle = createCallApi(HUSSIF, {
    type: 'GETARTICLE',
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
    type: 'EDITARTICLE',
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
