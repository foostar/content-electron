/* 发文平台
 *      platform
 *        |- 企鹅
 *        |    |- account 1
 *        |    `- account 2
 *        `- 百家
 *             |- account 1
 *             |- account 2
 *             `- account 3
 * data: {
 *     result: [1, 2],
 *     platforms: [
 *         {id: 1, name: '企鹅', accounts: [1, 2, 3]},
 *         {id: 2, name: '百家', accounts: [4, 5]}
 *     ],
 *     accounts: [
 *         {id: 1, name: 'xxx1'},
 *         {id: 2, name: 'xxx2'},
 *         {id: 3, name: 'xxx3'},
 *         {id: 4, name: 'bbb1'},
 *         {id: 5, name: 'bbb2'}
 *     ]
 * }
 */

import {makeAction, createReducer} from 'middlewares/api';
// import {createAction} from 'redux-act';

import update from 'react/lib/update';

const HUSSIF = {};
const INITAL = {
    fetching: false,
    data: {
        result: [],
        platforms: {},
        accounts: {}
    }
};

export const fetchPlatforms = makeAction(HUSSIF, {
    type: 'FETCH_PLATFORMS',
    endpoint: '/platforms',
    method: 'GET',
    request: (state, payload) => update(state, {
        fetching: {$set: true}
    }),
    success: (state, payload) => {
        return update(state, {
            fetching: {$set: false},
            data: {$set: payload.result.data}
        });
    },
    failure: (state, payload) => update(state, {
        fetching: {$set: true}
    })
});

export default createReducer(HUSSIF, INITAL);
