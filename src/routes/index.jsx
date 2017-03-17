import React from 'react';
import {Route, IndexRoute, Redirect} from 'react-router';
import {notification} from 'antd';

import HomePage from 'pages/HomePage';
import Layout from 'pages/Layout';
import Signin from 'pages/Signin';
import Contents from 'pages/Contents';
import NotFound from 'pages/NotFound';
import Editor from 'pages/Editor';
import AdminUsers from 'pages/admin/Users';
import AdminContents from 'pages/admin/Contents';
import AdminUpstreams from 'pages/admin/Upstreams';
import AdminStat from 'pages/admin/Stat';
import AdminStatByPlatform from 'pages/admin/Stat/Platform';
import AdminStatByRedactor from 'pages/admin/Stat/Redactor';
import AdminStatByAuthor from 'pages/admin/Stat/Author';

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
        <Route path='/' component={Layout} onEnter={onEnter} onChange={onChange}>
            <IndexRoute component={HomePage} />
            <Route path='contents' component={Contents} />

            <Redirect from='/editor' to='/editor/new' />
            <Route path='editor'>
                <Route path=':contentId' component={Editor} />
            </Route>

            <Route path='admin'>
                <Route path='users' component={AdminUsers} />
                <Route path='contents' component={AdminContents} />
                <Route path='upstreams' component={AdminUpstreams} />
                <Route path='stat' component={AdminStat}>
                    <IndexRoute component={AdminStatByPlatform} />
                    <Route path='redactor' component={AdminStatByRedactor} />
                    <Route path='author' component={AdminStatByAuthor} />
                </Route>
            </Route>
            <Route path='*' component={NotFound} />
        </Route>
    </Route>
);
