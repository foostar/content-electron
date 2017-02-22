import React, {Component} from 'react';
import WebView from 'components/WebView';
import {ipcRenderer} from 'electron';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as editorActions from 'reducers/admin/editor';

function createIdImage (mongoId) {
    const canvas = document.createElement('CANVAS');
    canvas.width = 2;
    canvas.height = 3;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(2, 3);

    mongoId.split('').forEach((d, idx) => {
        if (isNaN(d)) {
            imgData.data[idx] = d.charCodeAt();
        } else {
            imgData.data[idx] = Number(d);
        }
    });
    ctx.putImageData(imgData, 2, 3);
    return `<p><img src="${canvas.toDataURL('image/png')}"/></p>`;
};

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

        const secImg = createIdImage(this.props.content.id);

        if (res.type === 'ADMIN_GET_ARTICLE_SUCCESS') {
            let {title, content} = res.payload.result.data;
            content += secImg;
            let t = 0;
            const interval = setInterval(() => {
                this.webview.executeJavaScript(`$('#om-art-normal-title input').val()`, done => {
                    console.log('判断一次是否家在完成!');
                    t += 1;
                    if (!done && t < 30) return;
                    clearInterval(interval);

                    this.webview.executeJavaScript(`
                        $('#om-art-normal-title input').val(\`${title}\`);
                        window.frames['ueditor_0'].contentWindow.document.body.innerHTML = \`${content}\`;
                        $('#edui14_body').click();
                        $('.layui-layer-btn0').click();
                        $('.ui-radio[data-id="auto"]').click();
                    `);
                });
            }, 100);
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
