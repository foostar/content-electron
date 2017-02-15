import React, {Component} from 'react';
import WebView from 'components/WebView';
import Page from 'components/Page';

export default class extends Component {
    render () {
        return (
            <Page>
                <WebView
                    autoresize
                    src='https://github.com'
                />
            </Page>
        );
    }
}
