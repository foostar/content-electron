import React, {Component} from 'react';
import WebView from 'components/WebView';
import {ipcRenderer} from 'electron';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as editorActions from 'reducers/admin/editor';
import * as upstreamsActions from 'reducers/upstreams';

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
        editorActions: bindActionCreators(editorActions, dispatch),
        upstreamsActions: bindActionCreators(upstreamsActions, dispatch)
    };
};

@connect(null, mapDispatchToProps)
class QiE extends Component {
    state = {
        partition: `persist:${Date.now()}`,
        opacity: 0
    }
    updateCookies = () => {
        const session = ipcRenderer.sendSync('GET_COOKIES_BY_PARTITION', {
            partition: this.state.partition
        }).map(item => {
            item.url = 'https://om.qq.com/';
            return item;
        });

        this.props.upstreamsActions.updateUpstream({
            params: {id: this.props.upstream.id},
            body: {session}
        });
    }
    onDidStopLoading = () => {
        const url = this.webview.getURL();

        if (url === 'about:blank') {
            this.gotoPublishPage();
        }

        // 进入首页, 获取 cookies
        if (url === 'https://om.qq.com/') {
            this.updateCookies();
            this.webview.loadURL('https://om.qq.com/article/articlePublish');
        }

        if (url.startsWith('https://om.qq.com/userAuth/index')) {
            // 重新拿密码登录 获取 cookie, 保存cookie
            this.webview.executeJavaScript(`
                document.querySelector('#LEmail').value = '${this.props.upstream.account}';
                document.querySelector('#LPassword').value = '${this.props.upstream.password}';
                document.querySelector('.btnLogin').click();
            `);
        }

        if (url.startsWith('https://om.qq.com/article/articlePublish') && !this.injected) {
            this.injectPublishScript();
        }

        if (url.startsWith('https://om.qq.com/article/articleManage')) {
            this.props.nextStep();
        }
    }
    injectPublishScript = async () => {
        this.injected = true;
        const res = await this.props.editorActions.getArticle({
            params: this.props.content.id
        });

        if (res.type !== 'ADMIN_GET_ARTICLE_SUCCESS') return;

        let {title, content} = res.payload.result.data;

        // content += createIdImage(this.props.content.id);
        // const _debugger = this.webview.getWebContents().debugger;
        // _debugger.attach('1.1');
        // _debugger.on('message', (event, method, {response, requestId, type}) => {
        //     if (method === 'Network.responseReceived' && type === 'XHR') {
        //         console.log(response.url);
        //         if (response.url !== 'https://om.qq.com/editorCache/update?relogin=1') return;
        //         _debugger.sendCommand('Network.getResponseBody', {requestId}, (err, res) => {
        //             if (err) console.log(err);
        //             window.alert(res.body);
        //         });
        //     }
        // });
        // _debugger.sendCommand('Network.enable');

        // ipcRenderer.send('GET_REPONSE_BODY_BY_ID', {
        //     id: webviewId,
        //     url: 'https://om.qq.com/editorCache/update?relogin=1'
        // });

        // 通知主进程监听发布文章的接口
        // ipcRenderer.send('HANDLE_BEFORE_REQUEST_BY_PARTITION', {
        //     partition: this.state.partition,
        //     filter: {
        //         urls: [
        //             'https://om.qq.com/editorCache/update?relogin=1', // 草稿缓存更新接口 (测试用)
        //             'https://om.qq.com/article/publish?relogin=1'     // 发布接口
        //         ]
        //     }
        // });

        // ipcRenderer.on(`HANDLE_BEFORE_REQUEST_${this.state.partition}`, (event, data) => {
        //     console.log('HANDLE_BEFORE_REQUEST_', data);
        //     // this.webview.executeJavaScript(`
        //     //     $.ajax({
        //     //         method: 'POST',
        //     //         url: 'https://om.qq.com/article/publish?relogin=1',
        //     //         data: ${JSON.stringify(data)}
        //     //     })
        //     // `);
        // });

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
                    $('.main-heading').remove();
                    $('.header').remove();
                    $('.wrap').css({paddingTop: 0});
                    $('.main').css({float: 'none', width: 'auto'});
                    $('.viewpage').css({minWidth: 'initial'});
                    $('#editor-mask').css({width: 'auto'});
                    $('.container').css({width: 'auto'})
                    $('.fixed-bottom .form-action .toggle').css({left: 100});
                `);
            });
        }, 100);
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
                document.querySelector('#LEmail').value = '${this.props.upstream.account}';
                document.querySelector('#LPassword').value = '${this.props.upstream.password}';
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

// const publishData = {
//     content: '<html />',
//     video: '',
//     music: '',
//     title: '为什么说妻子决定了一个家庭的幸福',
//     imgurl_ext: [
//         {
//             '1': 'http://inews.gtimg.com/newsapp_ls/0/1194469605/0',
//             '150110': 'http://inews.gtimg.com/newsapp_ls/0/1194469605_150110/0',
//             '150120': 'http://inews.gtimg.com/newsapp_ls/0/1194469605_150120/0',
//             '196130': 'http://inews.gtimg.com/newsapp_ls/0/1194469605_196130/0',
//             '294195': 'http://inews.gtimg.com/newsapp_ls/0/1194469605_294195/0',
//             '300240': 'http://inews.gtimg.com/newsapp_ls/0/1194469605_300240/0',
//             '450360': 'http://inews.gtimg.com/newsapp_ls/0/1194469605_450360/0',
//             'src': 'http://inews.gtimg.com/newsapp_bt/0/1194468609/641'
//         }
//     ],
//     category_id: 21,
//     user_original: 0,
//     cover_type: -1,
//     tag: '',
//     type: 0,
//     commodity: '',
//     apply_olympic_flag: 0,
//     apply_push_flag: 0,
//     pushInfo: {
//         isSaved: false,
//         province: -1,
//         city: -1,
//         district: -1,
//         article_type: -1,
//         applyPushFlag: 0
//     },
//     apply_reward_flag: 1,
//     articleId: ''
// };
