import React, {Component} from 'react';
import WebView from 'components/WebView';
import style from './style.styl';

export default class extends Component {
    render () {
        return (
            <WebView
                autoresize
                className={style.webview}
                src='https://github.com'
            />
        );
    }
}
