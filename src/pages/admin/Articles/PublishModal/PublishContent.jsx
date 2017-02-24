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
        partition: `persist:${Date.now()}`,
        opacity: 0
    }
    onDidStopLoading = () => {
        const url = this.webview.getURL();
        if (url === 'about:blank') {
            this.gotoPublishPage();
        }

        if (url.startsWith('https://om.qq.com/article/articlePublish') && !this.injected) {
            this.injectPublishScript();
        }

        if (url.startsWith('https://om.qq.com/article/articleManage')) {
            this.props.nextStep();
        }

        if (url.startsWith('https://om.qq.com/userAuth/index')) {
            // 重新拿密码登录 获取 cookie, 保存cookie
            this.webview.executeJavaScript(`
                document.querySelector('#LEmail').value = '${this.props.data.account}';
                document.querySelector('#LPassword').value = '${this.props.data.password}';
            `);
        }
    }
    injectPublishScript = async () => {
        this.injected = true;
        const res = await this.props.editorActions.getArticle({
            params: this.props.content.id
        });

        const secImg = createIdImage(this.props.content.id);

        if (res.type === 'ADMIN_GET_ARTICLE_SUCCESS') {
            let {title, content} = res.payload.result.data;
            content += secImg;
            const interval = setInterval(() => {
                this.webview.executeJavaScript(`document.querySelector('#ueditor_0')`, done => {
                    if (!done) return;
                    clearInterval(interval);

                    this.webview.executeJavaScript(`
                        $('#om-art-normal-title input').val(\`${title}\`);
                        window.frames['ueditor_0'].contentWindow.document.body.innerHTML = '';
                        $('#edui14_body').click();
                        $('.layui-layer-content textarea').val(\`${content}\`)
                        $('.layui-layer-btn0').click();
                        $('.ui-radio[data-id="auto"]').click();
                        $('.icon-toggle-up-b').click();

                        $('.side').remove();
                        $('.main').css({float: 'none', width: 'auto'});
                        $('.viewpage').css({minWidth: 'initial'});
                        $('#editor-mask').css({width: 'auto'});
                        $('.container').css({width: 'auto'})
                        $('.fixed-bottom .form-action .toggle').css({left: 100});
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

@connect(null, mapDispatchToProps)
class BaiJia extends Component {
    state = {
        partition: `persist:${Date.now()}`
    }
    onDidStopLoading = () => {
        const url = this.webview.getURL();
        if (url === 'about:blank') {
            this.gotoPublishPage();
        }

        if (url.startsWith('http://baijiahao.baidu.com/builder/article/edit') && !this.injected) {
            this.injectPublishScript();
        }

        if (url.startsWith('http://baijiahao.baidu.com/builder/article/list')) {
            this.props.nextStep();
        }

        if (url.startsWith('http://baijiahao.baidu.com/builder/app/login')) {
            // 重新拿密码登录 获取 cookie, 保存cookie
            this.webview.executeJavaScript(`
                document.querySelector('#LEmail').value = '${this.props.data.account}';
                document.querySelector('#LPassword').value = '${this.props.data.password}';
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
            this.webview.loadURL('http://baijiahao.baidu.com/builder/article/edit');
        }
    }

    injectPublishScript = async () => {
        this.injected = true;
        const res = await this.props.editorActions.getArticle({
            params: this.props.content.id
        });

        const secImg = createIdImage(this.props.content.id);

        if (res.type === 'ADMIN_GET_ARTICLE_SUCCESS') {
            let {title, content} = res.payload.result.data;
            content += secImg;
            const interval = setInterval(() => {
                this.webview.executeJavaScript(`document.querySelector('#ueditor_0')`, done => {
                    if (!done) return;
                    clearInterval(interval);

                    this.webview.executeJavaScript(`
                        document.querySelector('#header-wrapper').remove();
                        document.querySelector('.aside').remove();
                        document.querySelector('.post-article-tips-wrap').remove();
                        document.querySelector('.mp-footer').remove();
                        document.querySelector('body').style.minWidth = 'initial';
                        document.querySelector('#pageWrapper').style.minWidth = 'initial';
                        document.querySelector('.editor-footer').style.padding = '10px';
                        document.querySelector('.editor-footer').style.minWidth = 'initial';
                        document.querySelector('.main').style.padding = 0;
                        document.querySelector('.main').style.margin = 0;
                        document.querySelector('#article-title').value = \`${title}\`;
                        window.frames['ueditor_0'].contentWindow.document.body.innerHTML = \`${content}\`;
                        editor.getEditor().focus();
                    `, () => {
                        this.webview.selectAll();
                        this.webview.cut();
                        this.webview.paste();
                    });
                });
            }, 100);
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

class PublishContent extends Component {
    render () {
        const {nextStep, content, data: {upstream}} = this.props;
        switch (upstream.platform) {
            case '企鹅号': return <QiE nextStep={nextStep} content={content} upstream={upstream} />;
            case '百家号': return <BaiJia nextStep={nextStep} content={content} upstream={upstream} />;
        }
    }
}

export default PublishContent;
