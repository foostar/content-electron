import React, {Component} from 'react';
// import WebView from 'components/WebView';
// import {ipcRenderer} from 'electron';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as editorActions from 'reducers/admin/editor';
import * as upstreamsActions from 'reducers/upstreams';
import {platformsById} from 'lib/platforms';
import style from './style.styl';

// function createIdImage (mongoId) {
//     const canvas = document.createElement('CANVAS');
//     canvas.width = 2;
//     canvas.height = 3;
//     const ctx = canvas.getContext('2d');
//     const imgData = ctx.createImageData(2, 3);

//     mongoId.split('').forEach((d, idx) => {
//         if (isNaN(d)) {
//             imgData.data[idx] = d.charCodeAt();
//         } else {
//             imgData.data[idx] = Number(d);
//         }
//     });
//     ctx.putImageData(imgData, 2, 3);
//     return `<p><img src="${canvas.toDataURL('image/png')}"/></p>`;
// };

const mapDispatchToProps = dispatch => {
    return {
        editorActions: bindActionCreators(editorActions, dispatch),
        upstreamsActions: bindActionCreators(upstreamsActions, dispatch)
    };
};

/*
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
} */

@connect(null, mapDispatchToProps)
class PublishContent extends Component {
    async componentDidMount () {
        const {account, password, session: cookies, platform: platformId} = this.props.data.upstream;
        const platform = new platformsById[platformId].Class(account, password, cookies);
        try {
            const res = await this.props.editorActions.getArticle({
                params: this.props.content.id
            });
            let {title, content} = res.payload.result.data;
            const link = await platform.publish(title, {content}, this.refs.wrap);
            this.props.nextStep({link});
        } catch (err) {
            console.error(err);
        }
    }
    render () {
        return (
            <div className={style['webview-wrap']} ref='wrap' />
        );
    }
}

export default PublishContent;

/*eslint-disable */

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

// Object
// article: Object
// Fabstract: 俗话说情人眼里出西施，所以在有爱情的时候，你一定会觉得对方最好看，即使有别的异性比你爱的对象好看，但对你而言，他才是你心中最没的一个，而且是别人无法相比的。第二种 亲爱的感觉　　当你爱上一个人，你会有种很亲切的感觉，跟他在一起，你会觉得很舒服，很和谐。你可以信任并依赖他。他像是一...'
// Falt_time: "2017-03-06 15:04:59"
// Fapply_olympic_flag: "0"
// Fapply_push_flag: "0"
// Fapply_reward_flag: "1"
// Fart_ad_switch: "1"
// Farticle_id: "20170306A053MS"
// Fcat_id_int: "21"
// Fcategory_id: "21"
// Fchoose_comment: "0"
// Fcontent: "<p class="">第一种 美丽的感觉</p><p style="margin- bottom:1px; padding - bottom:1px; " class="empty"><img src="http://inews.gtimg.com/newsapp_bt/0/1221068534/641" ori_src="http://ofsyr49wg.bkt.clouddn.com/prod/article/images/1488783788228"/></p><p type="om-image-desc" class=""></p><p class="empty"></p><p class="empty"></p><p class="">　　俗话说情人眼里出西施，所以在有爱情的时候，你一定会觉得对方最好看，即使有别的异性比你爱的对象好看，但对你而言，他才是你心中最没的一个，而且是别人无法相比的。</p><p class="">第二种 亲爱的感觉</p><p class="">　　当你爱上一个人，你会有种很亲切的感觉，跟他在一起，你会觉得很舒服，很和谐。你可以信任并依赖他。他像是一个亲密的家人，甚至可以说，比一个家人更亲密，而且在这亲密里，你更体会到一份温馨的感觉——这就是亲爱的感觉。在这个爱情的国度里，他愿意包容你所有的缺点。</p><p class="">第三种 羡慕及尊重有感觉<strong></strong></p><p class="empty"></p><p class="empty"></p><p class="empty"></p><p class="empty"></p><p style="margin-bottom:1px;padding-bottom:1px;" class="empty"><img src="http://inews.gtimg.com/newsapp_bt/0/1221068536/641" ori_src="http://ofsyr49wg.bkt.clouddn.com/prod/article/images/1488783788252"/></p><p type="om-image-desc" class=""></p><p class="empty"></p><p class="empty"></p><p class="">　　一个健康的爱情关系，应当有以对方为荣的感觉，你会欣赏对方所有的一切，包括内在与外在的条件和优点，并且对方也让你感觉，他处处以你为荣。如果这种感觉存在的话，不论他做这件事是成功或失败，你都会欣赏他的才华，而不是重视结果。</p><p class="">第四种 赞许的爱情</p><p style="margin-bottom:1px;padding-bottom:1px;" class="empty"><img src="http://inews.gtimg.com/newsapp_bt/0/1221068537/641" ori_src="http://ofsyr49wg.bkt.clouddn.com/prod/article/images/1488783788265"/></p><p type="om-image-desc" class=""></p><p class="empty"></p><p class="empty"></p><p class="">　　相爱的时候，你是否喜欢夸奖对方，而且不仅是欣赏，或敷衍了事而已，你还会喜欢在他不在的时候想其他人讲述他的种种好，哪怕帮你泡一碗方便面。重要的是，你从夸奖对方的热诚之中感到无比的快乐。</p><p class="">第五种 受到尊重的自尊</p><p style="margin-bottom:1px;padding-bottom:1px;" class="empty"><img src="http://inews.gtimg.com/newsapp_bt/0/1221068539/641" ori_src="http://ofsyr49wg.bkt.clouddn.com/prod/article/images/1488783788286"/></p><p type="om-image-desc" class=""></p><p class="empty"></p><p class="empty"></p><p class="">　　爱情关系可以提高一个人的自尊心，可以让个你感觉到生活的意义，因为爱情能够让你发现，其实你有着无人可比的独特性，虽然你有优点，也有缺点，但是你的独特性使你敌后到无比的尊重，生命也因此无比的快乐。</p><p class="">第六种 占有欲</p><p style="margin-bottom:1px;padding-bottom:1px;" class="empty"><img src="http://inews.gtimg.com/newsapp_bt/0/1221068540/641" ori_src="http://ofsyr49wg.bkt.clouddn.com/prod/article/images/1488783788308"/></p><p type="om-image-desc" class=""></p><p class="empty"></p><p class="empty"></p><p class="empty"></p><p class="">　　爱情是绝对独占的，是不能与他人分享其亲密的男女关系，因此，当爱情从不确定走向稳定后，需要以婚姻来持续以后的日子，所以我们在结婚时彼此相约相许。在真实的爱情生活里，活象许诺忠诚是必要的。</p><p class="">第七种 行动自由</p><p style="margin-bottom:1px;padding-bottom:1px;" class="empty"><img src="http://inews.gtimg.com/newsapp_bt/0/1221068824/641" ori_src="http://ofsyr49wg.bkt.clouddn.com/prod/article/images/1488783788321"/></p><p type="om-image-desc" class=""></p><p class="">第八种 深深的同情</p><p style="margin-bottom:1px;padding-bottom:1px;" class="empty"><img src="http://inews.gtimg.com/newsapp_bt/0/1221073958/641" ori_src="https://timgsa.baidu.com/timg?image&amp;quality=80&amp;size=b9999_10000&amp;sec=1488793817705&amp;di=d60bbacf25af49cd50d3fbac4a6e15b0&amp;imgtype=0&amp;src=http%3A%2F%2Fsh.99wed.com%2Fbbs%2Fdata%2Fattachment%2Fforum%2F201307%2F27%2F16193044smmojosd2mkbwz.jpg"/></p><p type="om-image-desc" class=""></p><p class="">　　人们对深爱的人常会有怜惜的感觉，经常会为对方考虑，如果对方受到挫折，我们会非常愿意为他分担痛苦与挫折，把对方所受的苦当作自己所遭遇的苦难一样，或是更胜于自己的苦难，因为爱情里，我们愿意为对方而牺牲自己的利益。</p><p class="">第九种 生理上的性冲动</p><p class="">　　当我们在对一为异性产生兴趣或是爱上某位异性时，都希望彼此有身体的接触。在正式的爱情生活里这种欲望是永远存在的。性冲动并不是单单只是行为，它还包括了许多其他亲密的身体上的接触，如牵手，拥抱等等，这种情感会永远存在于爱人心中。</p>"
// Fcopyright_status: 0
// Fcover_type: "3"
// Fdel_flag: "0"
// Fext2: "{"survey_id":null}"
// Fext3: ""
// Fimgurl: "http://inews.gtimg.com/newsapp_ls/0/1221070700_196130/0"
// Fimgurl_ext: "[{"1":"http://inews.gtimg.com/newsapp_ls/0/1221070700/0","150120":"http://inews.gtimg.com/newsapp_ls/0/1221070700_150120/0","192152":"http://inews.gtimg.com/newsapp_ls/0/1221070700_192152/0","196130":"http://inews.gtimg.com/newsapp_ls/0/1221070700_196130/0","294195":"http://inews.gtimg.com/newsapp_ls/0/1221070700_294195/0","src":"http://inews.gtimg.com/newsapp_bt/0/1221068534/641","index":0},{"1":"http://inews.gtimg.com/newsapp_ls/0/1221071484/0","150120":"http://inews.gtimg.com/newsapp_ls/0/1221071484_150120/0","192152":"http://inews.gtimg.com/newsapp_ls/0/1221071484_192152/0","196130":"http://inews.gtimg.com/newsapp_ls/0/1221071484_196130/0","294195":"http://inews.gtimg.com/newsapp_ls/0/1221071484_294195/0","src":"http://inews.gtimg.com/newsapp_bt/0/1221068536/641","index":0},{"1":"http://inews.gtimg.com/newsapp_ls/0/1221070826/0","150120":"http://inews.gtimg.com/newsapp_ls/0/1221070826_150120/0","192152":"http://inews.gtimg.com/newsapp_ls/0/1221070826_192152/0","196130":"http://inews.gtimg.com/newsapp_ls/0/1221070826_196130/0","294195":"http://inews.gtimg.com/newsapp_ls/0/1221070826_294195/0","src":"http://inews.gtimg.com/newsapp_bt/0/1221068537/641","index":2}]"
// Fmusic: ""
// Forg_time: "2017-03-06 15:04:59"
// Forignal: "0"
// Fpub_flag: "2"
// Fpub_time: "2017-03-06 15:05:00"
// FpushInfo: "{"id":"10031568","article_id":"20170306A053MS","user_id":"5394191","org_time":"2017- 03 - 06 15:04:59","alt_time":"2017- 03 - 06 15:04:59","push_time":"0000- 00 - 00 00:00:00","province":"- 1","city":"- 1","district":"- 1","names":"","title":"","article_type":"- 1","push_state":"0","ext":null}"
// Freward_flag: "0"
// Fsource: "0"
// Fsrcurl: ""
// Fsyncqzone: "0"
// Ftag: ""
// Ftargetid: "1798497581"
// Ftitle: "九种爱情的感觉到底是什么?"
// Ftype: "0"
// Fuin: ""
// Furl: "http://kuaibao.qq.com/s/20170306A053MS00"
// Fuser_id: "5394191"
// Fuser_original: "0"
// Fvideo: ""
// Fwechat: ""

/*eslint-enable */

