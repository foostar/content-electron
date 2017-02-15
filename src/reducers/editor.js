import { createReducer } from 'redux-act-async-api';
import { createAction } from 'redux-act';
// import update from 'react/lib/update';

const HUSSIF = {};
const INITAL = {
    isFetching: false,
    model: 'Example text'
};
// 更新编辑器里的内容
export const updateModel = createAction('UPDATE_MODEL');
// 强制loading
export const fetching = createAction('FETCHING');

HUSSIF[[ updateModel ]] = (state, model) => {
    return Object.assign({}, state, {
        model
    });
};

HUSSIF[[ fetching ]] = (state) => {
    return Object.assign({}, state, {
        isFetching: true
    });
};

// export const signin = makeAction(HUSSIF, {
//     type: 'EDITOR',
//     endpoint: '/signin',
//     method: 'POST',
//     request: (state, payload) => update(state, {
//         fetching: { $set: true }
//     }),
//     success: (state, payload) => update(state, {
//         fetching: { $set: false },
//         data: { $set: payload.result.data }
//     }),
//     failure: (state, payload) => update(state, {
//         fetching: { $set: true }
//     })
// });

export default createReducer(HUSSIF, INITAL);
