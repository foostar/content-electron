import React from 'react';
import WebviewHelper from 'utils/webview-helper';

export default class Webview extends React.Component {
    componentDidMount () {
        const helper = new WebviewHelper(this.props.webview);
        helper.appendTo(this.refs.container);
    }
    render () {
        const {className, visible} = this.props;
        return (
            <div ref='container' className={className} style={{height: visible ? '100%' : '0'}} />
        );
    }
};
