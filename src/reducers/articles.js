import {makeAction, createReducer} from 'middlewares/api';
import { createAction } from 'redux-act';
import update from 'react/lib/update';

const HUSSIF = {};
const INITAL = {
    isFetching: false,
    count: 50,
    skip: 0,
    selectKeys: [],
    contents: []
};
export const changeSelectRows = createAction('CHANGESELECTROWS');

HUSSIF[ changeSelectRows ] = (state, keys) => {
    return update(state, {
        selectKeys: { $set: keys }
    });
};
// 新增文章
export const getArticles = makeAction(HUSSIF, {
    type: 'GETARTICLES',
    endpoint: '/content',
    method: 'GET',
    request: (state, payload) => update(state, {
        isFetching: { $set: true }
    }),
    success: (state, payload) => {
        const {data} = payload.result;
        data.contents.forEach((v) => {
            v.key = v.id;
        });
        return Object.assign({}, state, data, {
            isFetching: false
        });
    },
    failure: (state, payload) => update(state, {
        isFetching: { $set: true }
    })
});

export default createReducer(HUSSIF, INITAL);
