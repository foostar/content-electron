import React, {Component} from 'react';
import WebView from 'components/WebView';

export default class extends Component {
    onDidFinishLoad () {
        console.log('onDidFinishLoad success');
    }
    render () {
        return (
            <WebView
                onDidFinishLoad={this.onDidFinishLoad}
                partition='persist:console'
                src='http://console.apps.xiaoyun.com'
            />
        );
    }
}
