import {createCallApi} from 'middlewares/api';
import {createAction, createReducer} from 'redux-act';
import update from 'react/lib/update';
import {format} from 'utils/util';

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
export const getArticles = createCallApi(HUSSIF, {
    type: 'GETARTICLES',
    endpoint: '/content',
    method: 'GET',
    request: (state, payload) => update(state, {
        isFetching: {$set: true}
    }),
    success: (state, payload) => {
        const {data} = payload.result;
        data.contents.forEach((v) => {
            v.key = v.id;
            v.createdAt = format(v.createdAt);
        });
        return Object.assign({}, state, data, {
            isFetching: false
        });
    },
    failure: (state, payload) => update(state, {
        isFetching: {$set: true}
    })
});

export default createReducer(HUSSIF, INITAL);
