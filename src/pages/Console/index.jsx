import React, {Component} from 'react';
import WebView from 'components/WebView';

export default class extends Component {
    render () {
        return (
            <WebView
                partition='persist:console'
                src='http://console.apps.xiaoyun.com'
            />
        );
    }
}
