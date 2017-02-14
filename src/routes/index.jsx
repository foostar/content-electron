import React from 'react';
import { Route, IndexRoute } from 'react-router';

import {notification} from 'antd';

import HomePage from 'pages/HomePage';
import Layout from 'pages/Layout';
import Signin from 'pages/Signin';

export default (store) => {
    function onChange (prevState, nextState, replace) {
        const state = store.getState();
        if (state.passport) {
            console.error('[on change]: no auth');
            replace('/signin');
        }
        notification.warning({
            message: '登录信息过期',
            description: '请重新登录'
        });
    }

    function onEnter (nextState, replace) {
        const state = store.getState();
        if (state.passport) {
            console.error('[on enter]: no auth');
            replace('/signin');
        }
    }

    return (
        <Route >
            <Route path='/signin' component={Signin} />
            <Route path='/'
                component={Layout}
                onEnter={onEnter}
                onChange={onChange}
            >
                <IndexRoute component={HomePage} />
            </Route>

        </Route>
    );
};
