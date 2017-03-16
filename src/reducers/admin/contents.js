import {createCallApi} from 'middlewares/api';
import {createReducer} from 'redux-act';
import update from 'react/lib/update';

const HUSSIF = {};
const INITAL = {
    fetching: false,
    count: 0,
    skip: 0,
    data: [],
    recentTag: [],
    condition: {
        author: [],
        includeTags: [],
        excludeTags: []
    }
};

// 获取文章列表
export const getContents = createCallApi(HUSSIF, {
    type: 'ADMIN_GET_CONTENTS',
    endpoint: '/contents/search',
    method: 'GET',
    request: (state, payload) => {
        return update(state, {
            fetching: {$set: true},
            condition: {
                author: {$set: payload.query.author || []},
                keyword: {$set: payload.query.keyword || []},
                category: {$set: payload.query.category || []},
                includeTags: {$set: payload.query.includeTags || []},
                excludeTags: {$set: payload.query.excludeTags || []}
            }
        });
    },
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

// 获取最近使用的tag
export const getRecentTag = createCallApi(HUSSIF, {
    type: 'ADMIN_GET_RECENT_TAG',
    endpoint: '/contents/most-common-tags',
    method: 'GET',
    request: (state, payload) => update(state, {
        fetching: {$set: true}
    }),
    success: (state, payload) => update(state, {
        recentTag: {$set: payload.result.data.tags},
        fetching: {$set: false}
    }),
    failure: (state, payload) => update(state, {
        fetching: {$set: true}
    })
});

// 增加tag
export const addTag = createCallApi(HUSSIF, {
    type: 'ADMIN_ADD_TAG',
    endpoint: '/contents/:id/tag/:tag',
    method: 'POST',
    request: (state, payload) => update(state, {
        fetching: {$set: true}
    })
});

// 删除tag
export const removeTag = createCallApi(HUSSIF, {
    type: 'ADMIN_REMOVE_TAG',
    endpoint: '/contents/:id/tag/:tag',
    method: 'DELETE'
});

// 搜索username
export const searchUser = createCallApi(HUSSIF, {
    type: 'ADMIN_SEARCH_USER',
    endpoint: '/users',
    method: 'GET'
});

export const getContent = createCallApi(HUSSIF, {
    type: 'GET_CONTENT',
    endpoint: '/contents'
});

export default createReducer(HUSSIF, INITAL);
