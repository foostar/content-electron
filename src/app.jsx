import 'babel-polyfill';
import {ipcRenderer} from 'electron';
import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {Router, hashHistory} from 'react-router';
import routes from 'routes';
import store from 'store';

render(
    <Provider store={store}>
        <Router history={hashHistory} routes={routes} />
    </Provider>,
    document.querySelector('#app')
);

ipcRenderer.on('GET_COOKISES_BY_PARTITION_SUCCESS', (event, data) => {
    if (!data) return;
    const {platform, account, cookies} = data;
    console.info(platform, account);
    console.dir(cookies);
});
