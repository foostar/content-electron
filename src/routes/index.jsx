import React from 'react';
import { Route, IndexRoute } from 'react-router';

import { notification } from 'antd';

import HomePage from 'pages/HomePage';
import Layout from 'pages/Layout';
import Signin from 'pages/Signin';
import Articles from 'pages/Articles';
import User from 'pages/User';
import Editor from 'pages/Editor';
import NotFound from 'pages/NotFound';
import GitHub from 'pages/GitHub';
import Console from 'pages/Console';
import AdminUsers from 'pages/admin/Users';
import AdminArticles from 'pages/admin/Articles';
import AdminPlatfrom from 'pages/admin/Platform';

import store from 'store';

function hasPassport () {
    return store.getState().passport.data.token;
}
function onChange (prevState, nextState, replace) {
    if (hasPassport()) return;
    console.info(`[NO PASSPORT]: Change to ${nextState.location.pathname}!`);
    replace('/signin');
    notification.warning({
        message: '登录信息过期',
        description: '请重新登录'
    });
}

function onEnter (nextState, replace) {
    if (hasPassport()) return;
    console.info(`[NO PASSPORT]: Enter to ${nextState.location.pathname}!`);
    replace('/signin');
}

export default (
    <Route >
        <Route path='/signin' component={Signin} />
        <Route path='/'
            component={Layout}
            onEnter={onEnter}
            onChange={onChange}
        >
            <IndexRoute component={HomePage} />
            <Route path='/editor' component={Editor} />
            <Route path='articles' component={Articles} />
            <Route path='user' component={User} />
            <Route path='github' component={GitHub} />
            <Route path='console' component={Console} />
            <Route path='console2' component={Console} />
            <Route path='admin'>
                <Route path='users' component={AdminUsers} />
                <Route path='articles' component={AdminArticles} />
                <Route path='platfrom' component={AdminPlatfrom} />
            </Route>
            <Route path='*' component={NotFound} />
        </Route>
    </Route>
);
