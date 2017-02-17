import React, {Component} from 'react';
// import {Row, Col, Card} from 'antd';
// import style from './style.styl';
import WebView from 'components/WebView';

export default class SigninPlatform extends Component {
    render () {
        return (
            <div style={{height: '100%'}}>
                <WebView
                    partition={`persist:${Date.now()}`}
                    src='http://baijiahao.baidu.com/builder/app/login'
                />
            </div>
        );
    }
}
