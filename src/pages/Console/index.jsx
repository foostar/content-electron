import React, {Component} from 'react';
import WebView from 'components/WebView';
import Page from 'components/Page';

export default class extends Component {
    onDidFinishLoad () {
        console.log('onDidFinishLoad success');
    }
    render () {
        return (
            <Page>
                <WebView
                    onDidFinishLoad={this.onDidFinishLoad}
                    partition='persist:console'
                    src='http://console.apps.xiaoyun.com'
                />
            </Page>
        );
    }
}
