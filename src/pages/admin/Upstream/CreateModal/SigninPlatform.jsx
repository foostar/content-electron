import React, {Component} from 'react';
import {Alert} from 'antd';
import WebView from 'components/WebView';
import {ipcRenderer} from 'electron';

// import style from './style.styl';

export default class SigninPlatform extends Component {
    render () {
        switch (this.props.data.platform) {
            case '企鹅号': return <Qie />;
            case '百家号': return <Baijia />;
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

class Qie extends Component {
    state = {
        partition: `persist:${Date.now()}`
    }
    onDidStopLoading = () => {
        const url = this.webview.getURL();
        console.info('企鹅号:', url);
        if (url === 'https://om.qq.com/userAuth/index') {
            this.webview.executeJavaScript(`
                document.querySelector('#LEmail').value = 'mameiling@goyoo.com';
                document.querySelector('#LPassword').value = 'zxc123456';
            `);
        }
        // 登录成功, 获取 cookies
        if (url === 'https://om.qq.com/') {
            const cookies = ipcRenderer.sendSync('GET_COOKIES_BY_PARTITION', {
                partition: this.state.partition
            });
            // 需要把接口 session 字段改成 {} 或者 []
            console.log(cookies);
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
                document.querySelector('#TANGRAM__PSP_4__password').value = 'Songpeng123';
            `);
        }

        if (url === 'http://baijiahao.baidu.com/') {
            // TODO
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
