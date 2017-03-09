import {createCallApi} from 'middlewares/api';
import {createAction, createReducer} from 'redux-act';
import update from 'react/lib/update';

const HUSSIF = {};
const INITAL = {
    isFetching: false,
    content: '',
    title: '',
    category: '',
    modalVisible: false,
    isAlter: false,
    originSrc: '',
    id: ''
};
// 更新编辑器里的内容
export const updateModel = createAction('UPDATE_MODEL');
// 强制loading
export const fetching = createAction('FETCHING');
// 清空表单
export const clearArticle = createAction('CLEARARTICLE');
// 关闭图像处理
export const modalCancel = createAction('MODALCANCEL');
// 开启图像处理
export const handleImg = createAction('HANDLEIMG');

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

HUSSIF[ modalCancel ] = (state, content) => {
    return Object.assign({}, state, {
        modalVisible: false,
        isAlter: false
    });
};

HUSSIF[ handleImg ] = (state, src) => {
    return Object.assign({}, state, {
        modalVisible: true,
        isAlter: true,
        originSrc: src
    });
};
// 新增文章
export const addArticle = createCallApi(HUSSIF, {
    type: 'ADDARTICLE',
    endpoint: '/contents',
    method: 'POST',
    request: (state, payload) => update(state, {
        isFetching: {$set: true}
    }),
    success: (state, payload) => {
        const {data} = payload.result;
        return Object.assign({}, state, data);
    },
    failure: (state, payload) => update(state, {
        isFetching: {$set: false}
    })
});

// 文章详情
export const getArticle = createCallApi(HUSSIF, {
    type: 'GETARTICLE',
    endpoint: '/contents',
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
    endpoint: '/contents',
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

// 替换路径
export const replaceImg = createCallApi(HUSSIF, {
    type: 'REPLACEIMG',
    endpoint: '/qiniu/replace-src',
    method: 'POST',
    request: (state, payload) => update(state, {
        isFetching: {$set: true}
    }),
    success: (state, payload) => update(state, {
        isFetching: {$set: false}
    }),
    failure: (state, payload) => update(state, {
        isFetching: {$set: false}
    })
});

export default createReducer(HUSSIF, INITAL);
