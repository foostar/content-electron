import React, {Component} from 'react';
import {Alert} from 'antd';
// import WebView from 'components/WebView';
// import {ipcRenderer} from 'electron';
import style from './style.styl';

import {platformsById} from 'lib/platforms';

// import OMQQPlatform from 'lib/omqq-platform';

/*
class QiE extends Component {
    state = {
        partition: `persist:${Date.now()}`
    }
    onDidStopLoading = () => {
        const url = this.webview.getURL();
        console.info('企鹅号:', url);

        // 登录界面
        if (url.startsWith('https://om.qq.com/userAuth/index')) {
            this.webview.executeJavaScript(`
                document.querySelector('#LEmail').value = '${this.props.data.account}';
                document.querySelector('#LPassword').value = '${this.props.data.password}';
                document.querySelector('.btnLogin').click();
            `);
        }

        // 登录成功, 获取 cookies
        if (url === 'https://om.qq.com/') {
            const session = ipcRenderer.sendSync('GET_COOKIES_BY_PARTITION', {
                partition: this.state.partition
            }).map(item => {
                item.url = 'https://om.qq.com/';
                return item;
            });
            this.webview.executeJavaScript(`
                document.querySelector('.header-login-inner .name').innerText
            `, (nickname) => {
                this.props.nextStep({session, nickname});
            });
        }
    }
    render () {
        return (
            <WebView
                getRef={webview => { this.webview = webview; }}
                onDidStopLoading={this.onDidStopLoading}
                partition={this.state.partition}
                src='https://om.qq.com/userAuth/index'
            />
        );
    }
} */

/* class BaiJia extends Component {
    state = {
        partition: `persist:${Date.now()}`
    }
    onDidStopLoading = () => {
        const url = this.webview.getURL();
        console.info('百家号:', url);

        // 登录界面
        if (url.startsWith('http://baijiahao.baidu.com/builder/app/login') && !this.inputValue) {
            this.inputValue = true;
            this.webview.executeJavaScript(`
                document.querySelector('#TANGRAM__PSP_4__userName').value = '${this.props.data.account}';
                document.querySelector('#TANGRAM__PSP_4__password').value = '${this.props.data.password}';
                document.querySelector('#TANGRAM__PSP_4__submit').click();
            `);
        }

        // 登录成功, 获取 cookies
        if (url === 'http://baijiahao.baidu.com/') {
            const session = ipcRenderer.sendSync('GET_COOKIES_BY_PARTITION', {
                partition: this.state.partition
            }).map(item => {
                item.url = 'http://baijiahao.baidu.com/';
                return item;
            });
            this.webview.executeJavaScript(`
                document.querySelector('.mp-header-user .author .name').innerText;
            `, (nickname) => {
                this.props.nextStep({nickname, session});
            });
        }
    }
    render () {
        return (
            <WebView
                getRef={webview => { this.webview = webview; }}
                onDidStopLoading={this.onDidStopLoading}
                partition={this.state.partition}
                src='http://baijiahao.baidu.com/builder/app/login'
            />
        );
    }
} */
// class QiE extends Component {
//     async componentDidMount () {
//         const {account, password} = this.props.data;
//         const platform = new OMQQPlatform(account, password);
//         // this.refs.wrap.appendChild(platform.webview);
//         try {
//             const data = await platform.login();
//             console.log(data);
//             this.props.nextStep(data);
//         } catch (err) {
//             console.log(err);
//         }
//     }
//     render () {
//         return <div ref='wrap' />;
//     }
// }
class SigninPlatform extends Component {
    async componentDidMount () {
        const {platform: platformId} = this.props.data;
        const platform = new platformsById[platformId].Class(this.props.data);
        try {
            const data = await platform.login(this.refs.wrap);
            this.props.nextStep(data);
        } catch (err) {
            console.error(err);
        }
    }
    render () {
        switch (this.props.data.platform) {
            case platformsById.omqq.id: return <div className={style['webview-wrap']} ref='wrap' />;
            case platformsById.baijia.id: return <div className={style['webview-wrap']} ref='wrap' />;
            default: return (
                <Alert
                    type='warning'
                    message='抱歉'
                    description='暂未支持该平台'
                />
            );
        }
    }
}

export default SigninPlatform;
