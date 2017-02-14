import 'babel-polyfill';
import React from 'react';
import {render} from 'react-dom';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import createRoutes from 'routes';
import createStore from 'store';

const store = createStore();
const routes = createRoutes(store);

render(
    <Provider store={store}>
        <Router history={hashHistory} routes={routes} />
    </Provider>,
    document.querySelector('#app')
);

