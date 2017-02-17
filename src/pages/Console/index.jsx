import React, {Component} from 'react';
import WebView from 'components/WebView';
import Page from 'components/Page';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
// import {hashHistory} from 'react-router';
import * as actions from 'reducers/cookies';

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
        const getCookiesRes = await this.props.actions.getCookiesByPartition({
            partition: `persist:${this.props.location.pathname}`,
            url: 'http://console.apps.xiaoyun.com/'
        });
        if (getCookiesRes.type !== 'GET_COOKIES_BY_PARTITION_SUCCESS') return;

        console.dir(getCookiesRes.payload);
        // TODO post cookies

        // this.props.actions.setPartitionCookies({
        //     partition: 'persist:/console2',
        //     cookies: getCookiesRes.payload.map(x => {
        //         x.url = this.webview.getURL();
        //         return x;
        //     })
        // });
    }
    onDomReady = () => {
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
                    onDomReady={this.onDomReady}
                    partition={`persist:${this.props.location.pathname}`}
                    src='http://console.apps.xiaoyun.com'
                />
            </Page>
        );
    }
}
