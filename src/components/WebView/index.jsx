import React from 'react';
import {Spin} from 'antd';
import style from './style.styl';

import WEBVIEW_EVENT from './webview-events';

export default class extends React.Component {
    state = {loading: true}

    componentDidMount () {
        this.setAttribute();

        this.handleEvents = Object.keys(this.props)
            .map(key => ({event: camel2Hyphen(key), handler: key}))
            .filter(({event}) => WEBVIEW_EVENT.includes(event));

        this.bindEvent();
        this.refs.webview.setAttribute('src', this.props.src);
    }

    componentWillUnmount () {
        this.unbindEvent();
    }

    setAttribute () {
        /*eslint-disable */
        const {
            style,
            className,
            src = '',
            ...restProps
        } = this.props;
        /*eslint-enable */

        Object.entries(restProps).map(([k, v]) => {
            this.refs.webview.setAttribute(k, v);
        });
    }

    onDomReady = () => {
        const {webview} = this.refs;
        this.setState({loading: false});
        webview.openDevTools();
        this.props.onDomReady && this.props.onDomReady(webview);
    }

    bindEvent () {
        const {webview} = this.refs;
        webview.addEventListener('dom-ready', this.onDomReady);

        this.handleEvents.forEach(({event, handler}) => {
            webview.addEventListener(event, this.props[handler].bind(webview));
        });
    }

    unbindEvent () {
        const {webview} = this.refs;
        webview.removeEventListener('dom-ready', this.onDomReady);
        this.handleEvents.forEach(({event, handler}) => {
            webview.removeEventListener(event, this.props.handler);
        });
    }

    render () {
        return (
            <div className={style.container}>
                <Spin spinning={this.state.loading}>
                    <webview ref='webview' style={{width: '100%', height: '100%'}} />
                </Spin>
            </div>
        );
    }
}

function camel2Hyphen (str) {
    return str
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^on-/, '');
}

