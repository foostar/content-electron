import React, {Component} from 'react';
import WebView from 'components/WebView';
import Page from 'components/Page';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
// import {hashHistory} from 'react-router';
import * as actions from 'reducers/platforms';

const getAccountScript = `window.__INITIAL_STATE__.passport.name;`;

const mapStateToProps = state => {
    return {
        platforms: state.platforms
    };
};
const mapDispatchToProps = dispatch => {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
};

@connect(mapStateToProps, mapDispatchToProps)
export default class extends Component {
    createAccount = async () => {
        const getCookiesRes = await this.props.actions
            .getCookiesByPartition('persist:console');

        if (getCookiesRes.type !== 'GET_COOKIES_BY_PARTITION_SUCCESS') return;
        console.dir(getCookiesRes.payload);
    }
    onDidStopLoading = () => {
        if (this.webview.getURL() !== 'http://console.apps.xiaoyun.com/') return;
        this.webview.executeJavaScript(
            getAccountScript,
            this.createAccount
        );
    }
    render () {
        return (
            <Page>
                <WebView
                    getRef={webview => { this.webview = webview; }}
                    onDidStopLoading={this.onDidStopLoading}
                    onDomReady={this.onDomReady}
                    partition={`persist:${this.props.location.pathname}`}
                    src='http://console.apps.xiaoyun.com'
                />
            </Page>
        );
    }
}
