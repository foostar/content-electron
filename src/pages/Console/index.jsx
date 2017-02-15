import React, {Component} from 'react';
import {ipcRenderer} from 'electron';

import WebView from 'components/WebView';
import Page from 'components/Page';

const isConsoleLogin = `window.__INITIAL_STATE__;`;

export default class extends Component {
    getCookies (isLogin) {
        if (!isLogin) return;
        ipcRenderer.send('GET_COOKISE_BY_PARTITION', 'persist:console');
    }
    onDidStopLoading = (...args) => {
        if (this.webview.getURL() === 'http://console.apps.xiaoyun.com/') {
            this.webview.executeJavaScript(
                isConsoleLogin,
                this.getCookies
            );
        }
    }
    render () {
        return (
            <Page>
                <WebView
                    getRef={webview => { this.webview = webview; }}
                    onDidStopLoading={this.onDidStopLoading}
                    onDomReady={this.onDomReady}
                    partition='persist:console'
                    src='http://console.apps.xiaoyun.com'
                />
            </Page>
        );
    }
}
