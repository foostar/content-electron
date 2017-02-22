import React, {Component} from 'react';
import WebView from 'components/WebView';
import {ipcRenderer} from 'electron';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as editorActions from 'reducers/admin/editor';

const mapDispatchToProps = dispatch => {
    return {
        editorActions: bindActionCreators(editorActions, dispatch)
    };
};

@connect(null, mapDispatchToProps)
class QiE extends Component {
    state = {
        partition: `persist:${Date.now()}`
    }
    onDidStopLoading = () => {
        const url = this.webview.getURL();
        if (url === 'about:blank') {
            this.gotoPublishPage();
        }

        if (url === 'https://om.qq.com/article/articlePublish') {
            this.injectPublishScript();
        }
    }
    injectPublishScript = async () => {
        const res = await this.props.editorActions.getArticle({
            params: this.props.content.id
        });
        if (res.type === 'ADMIN_GET_ARTICLE_SUCCESS') {
            const {title, content} = res.payload.result.data;
            console.log(content);
            this.webview.executeJavaScript(`
                setTimeout(() => {
                    alert(11111);
                    document.querySelector('#om-art-normal-title input').value = ${title};
                    window.frames['ueditor_0'].contentWindow.document.body.innerHTML = \`${content}\`;
                }, 3000)
            `);
        }
    }
    gotoPublishPage = () => {
        const cookies = this.props.upstream.session;
        const ok = ipcRenderer.sendSync('SET_PARTITION_COOKIES', {
            partition: this.state.partition,
            cookies
        });
        if (ok) {
            this.webview.loadURL('https://om.qq.com/article/articlePublish');
        }
    }
    render () {
        return (
            <WebView
                disablewebsecurity
                getRef={webview => { this.webview = webview; }}
                onDidStopLoading={this.onDidStopLoading}
                partition={this.state.partition}
                src='about:blank'
            />
        );
    }
}

class BaiJia extends Component {
    render () {
        return (
            BaiJia
        );
    }
}

class PublishContent extends Component {
    render () {
        const {content, data: {upstream}} = this.props;
        switch (upstream.platform) {
            case '企鹅号': return <QiE content={content} upstream={upstream} />;
            case '百家号': return <BaiJia content={content} upstream={upstream} />;
        }
    }
}

export default PublishContent;
