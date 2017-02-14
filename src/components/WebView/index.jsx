import React from 'react';
import {Spin} from 'antd';

import style from './style.styl';

export default class extends React.Component {
    state = {
        loading: true
    }
    componentDidMount () {
        const {style = {}, className, src = '', ...restProps} = this.props;
        const {webview} = this.refs;

        Object.entries(restProps).map(([k, v]) => {
            webview.setAttribute(k, v);
        });

        Object.entries(style).map(([k, v]) => {
            webview.style[k] = v;
        });

        webview.className = className;
        webview.setAttribute('src', src);

        webview.addEventListener('dom-ready', () => {
            this.setState({
                loading: false
            });
        });
    }

    render () {
        return (
            <div className={style.container}>
                <Spin spinning={this.state.loading}>
                    <webview ref='webview' />
                </Spin>
            </div>
        );
    }
}
