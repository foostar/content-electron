import React, {Component} from 'react';
import WebView from 'components/WebView';

export default class extends Component {
    render () {
        return (
            <WebView
                autoresize
                src='https://github.com'
            />
        );
    }
}
