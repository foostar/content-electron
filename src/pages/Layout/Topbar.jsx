import React, {Component} from 'react';
import {hashHistory} from 'react-router';
import style from './style.styl';
import {Button, Dropdown, Icon, Menu} from 'antd';
import {connect} from 'react-redux';
import TopMenu from './TopMenu';

const mapStateToProps = state => {
    return {
        passport: state.passport.data
    };
};

@connect(mapStateToProps)
export default class Topbar extends Component {
    userAction = ({key}) => {
        if (key === 'signout') {
            hashHistory.replace('/signin');
        }
    }
    render () {
        const {username} = this.props.passport;
        const menu = (
            <Menu onClick={this.userAction}>
                {/*
                <Menu.Item key='2'>修改密码</Menu.Item>
                */}
                <Menu.Divider />
                <Menu.Item key='signout'>退出登录</Menu.Item>
            </Menu>
        );
        return (
            <div className={style.topbar}>
                <div className={style.brand}>
                    <span>蜂巢</span>内容平台
                </div>
                <TopMenu />
                <div className={style['user-board']}>
                    <Dropdown overlay={menu} trigger={['click']}>
                        <Button>
                            {username} <Icon type='down' />
                        </Button>
                    </Dropdown>
                </div>
            </div>
        );
    }
}

