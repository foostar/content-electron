import React, {Component} from 'react';
import {ipcRenderer} from 'electron';

import WebView from 'components/WebView';
import Page from 'components/Page';

const getAccountScript = `window.__INITIAL_STATE__.passport.name;`;

export default class extends Component {
    sendGetCookiesRequest (account) {
        if (!account) return;

        ipcRenderer.send(
            'GET_COOKISES_BY_PARTITION_REQUEST',
            {
                account,
                platform: '小云 • console',
                partition: 'persist:console'
            }
        );
    }
    onDidStopLoading = () => {
        if (this.webview.getURL() !== 'http://console.apps.xiaoyun.com/') return;

        this.webview.executeJavaScript(
            getAccountScript,
            this.sendGetCookiesRequest
        );
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
