import React from 'react';

export default class extends React.Component {
    state = {
        loading: true
    }
    componentDidMount () {
        const {style = {}, className, ...restProps} = this.props;
        const {webview} = this.refs;

        Object.entries(restProps).map(([k, v]) => {
            webview.setAttribute(k, v);
        });

        Object.entries(style).map(([k, v]) => {
            webview.style[k] = v;
        });

        webview.className = className;

        webview.addEventListener('did-stop-loading', () => {
            this.setState({
                loading: false
            });
        });
    }

    render () {
        return (
            <webview ref='webview' />
        );
    }
}
