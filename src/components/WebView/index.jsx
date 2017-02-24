import React from 'react';
import {Spin, Icon} from 'antd';
import style from './style.styl';
import _ from 'lodash';

import {WEBVIEW_EVENT, AVAILABLE_ATTRIBUTES} from './util';

export default class extends React.Component {
    state = {loading: true}
    componentDidMount () {
        this.props.getRef && this.props.getRef(this.refs.webview);
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
        Object.entries(
            _.pickBy(
                this.props,
                (value, key) => AVAILABLE_ATTRIBUTES.includes(key)
            )
        ).map(([k, v]) => {
            this.refs.webview.setAttribute(k, v);
        });
    }
    onDomReady = (...args) => {
        this.setState({loading: false});
        this.props.onDomReady && this.props.onDomReady(...args);
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
    openDevTools = () => {
        this.refs.webview.openDevTools();
    }
    render () {
        return (
            <div className={style.container}>
                {process.env.NODE_ENV !== 'production' &&
                    <Icon
                        type='setting'
                        className={style['dev-tool']}
                        onClick={this.openDevTools}
                    />
                }
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

