import React, {Component} from 'react';
import {Alert} from 'antd';
import WebView from 'components/WebView';
import {ipcRenderer} from 'electron';

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
}

class BaiJia extends Component {
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
}

class SigninPlatform extends Component {
    render () {
        switch (this.props.data.platform) {
            case '企鹅号': return <QiE {...this.props} />;
            case '百家号': return <BaiJia {...this.props} />;
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
