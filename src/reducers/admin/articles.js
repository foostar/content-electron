import {createCallApi} from 'middlewares/api';
import {createAction, createReducer} from 'redux-act';
import update from 'react/lib/update';
import {format} from 'utils/util';

const HUSSIF = {};
const INITAL = {
    isFetching: false,
    count: 50,
    skip: 0,
    contents: [],
    article: {
        tags: []
    },
    modalVisible: false,
    recentTag: [],
    form: {
        includeTags: [],
        excludeTags: []
    },
    expand: false
};
// 改变页数
export const pageChange = createAction('ADMIN_PAGECHANGE');
// 更改标签显示
export const showNewTag = createAction('SHOWNEWTAG');
// 更改搜索条件
export const changeForm = createAction('CHANGEFORM');
// 展开高级搜索
export const toggle = createAction('TOGGLE');

HUSSIF[ pageChange ] = (state, skip) => {
    return Object.assign({}, state, {
        skip
    });
};
HUSSIF[ changeForm ] = (state, form) => {
    return Object.assign({}, state, {
        form
    });
};
HUSSIF[ toggle ] = (state, skip) => {
    return Object.assign({}, state, {
        expand: !state.expand
    });
};
HUSSIF[ showNewTag ] = (state, data) => {
    const contents = state.contents;
    contents.forEach((v) => {
        if (v.id == data.id) {
            v.inputVisible = data.isShow;
        }
    });
    return Object.assign({}, state, {
        contents
    });
};
// 获取文章列表
export const getArticles = createCallApi(HUSSIF, {
    type: 'ADMIN_GETARTICLES',
    endpoint: '/content/search',
    method: 'GET',
    request: (state, payload) => update(state, {
        isFetching: {$set: true}
    }),
    success: (state, payload) => {
        const {data} = payload.result;
        data.contents.forEach((v) => {
            v.key = v.id;
            v.createdAt = format(v.createdAt);
            v.inputVisible = false;
            v.inputValue = [];
        });
        return Object.assign({}, state, data, {
            isFetching: false
        });
    },
    failure: (state, payload) => update(state, {
        isFetching: {$set: true}
    })
});
// 获取最近使用的tag
export const getRecentTag = createCallApi(HUSSIF, {
    type: 'ADMIN_GETRECENTTAG',
    endpoint: '/content/most-common-tags',
    method: 'GET',
    request: (state, payload) => update(state, {
        isFetching: {$set: true}
    }),
    success: (state, payload) => {
        const {data} = payload.result;
        return Object.assign({}, state, {
            recentTag: data.tags,
            isFetching: false
        });
    },
    failure: (state, payload) => update(state, {
        isFetching: {$set: true}
    })
});
// 增加tag
export const addTag = createCallApi(HUSSIF, {
    type: 'ADMIN_ADDTAG',
    endpoint: '/content/:id/tag/:tag',
    method: 'POST',
    request: (state, payload) => update(state, {
        isFetching: {$set: true}
    }),
    success: (state, payload) => {
        const {data} = payload.result;
        const {id, tags} = data;
        const {recentTag, contents} = state;
        contents.forEach((v) => {
            if (v.id == id) {
                v.tags = tags;
                v.inputVisible = false;
            }
        });
        recentTag.unshift(tags[tags.length - 1]);
        if (recentTag.length > 20) {
            recentTag.shift();
        }
        return Object.assign({}, state, {
            contents,
            isFetching: false,
            recentTag
        });
    },
    failure: (state, payload) => update(state, {
        isFetching: {$set: true}
    })
});
// 删除tag
export const removeTag = createCallApi(HUSSIF, {
    type: 'ADMIN_REMOVETAG',
    endpoint: '/content/:id/tag/:tag',
    method: 'DELETE',
    request: (state, payload) => update(state, {
        isFetching: {$set: true}
    }),
    success: (state, payload) => {
        const {data} = payload.result;
        const {id, tags} = data;
        const contents = state.contents;
        contents.forEach((v) => {
            if (v.id == id) {
                v.tags = tags;
            }
        });
        return Object.assign({}, state, {
            contents,
            isFetching: false
        });
    },
    failure: (state, payload) => update(state, {
        isFetching: {$set: true}
    })
});

export default createReducer(HUSSIF, INITAL);
