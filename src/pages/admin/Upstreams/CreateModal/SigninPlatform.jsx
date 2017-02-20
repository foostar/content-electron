import React, {Component} from 'react';
import {Alert} from 'antd';
import WebView from 'components/WebView';
import {ipcRenderer} from 'electron';

// import style from './style.styl';

class Qie extends Component {
    state = {
        partition: `persist:${Date.now()}`
    }
    onDidStopLoading = () => {
        const url = this.webview.getURL();
        console.info('企鹅号:', url);
        // 登录界面
        if (url === 'https://om.qq.com/userAuth/index') {
            this.webview.executeJavaScript(`
                document.querySelector('#LEmail').value = '${this.props.data.account}';
                document.querySelector('#LPassword').value = '${this.props.data.password}';
            `);
        }

        // 登录成功, 获取 cookies
        if (url === 'https://om.qq.com/') {
            const session = ipcRenderer.sendSync('GET_COOKIES_BY_PARTITION', {
                partition: this.state.partition
            });
            this.props.nextStep({session});
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

class Baijia extends Component {
    state = {
        partition: `persist:${Date.now()}`
    }
    onDidStopLoading = () => {
        const url = this.webview.getURL();
        console.info('百家号:', url);
        if (url === 'http://baijiahao.baidu.com/builder/app/login') {
            this.webview.executeJavaScript(`
                document.querySelector('#TANGRAM__PSP_4__userName').value = '17600806970';
                document.querySelector('#TANGRAM__PSP_4__password').value = 'zxc123456';
            `);
        }

        // 登录成功, 获取 cookies
        if (url === 'http://baijiahao.baidu.com/') {
            const session = ipcRenderer.sendSync('GET_COOKIES_BY_PARTITION', {
                partition: this.state.partition
            });
            this.props.nextStep({session});
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
            case '企鹅号': return <Qie {...this.props} />;
            case '百家号': return <Baijia {...this.props} />;
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
