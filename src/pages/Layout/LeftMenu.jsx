import React, {Component} from 'react';
import {hashHistory} from 'react-router';
import { Menu, Icon } from 'antd';

import style from './style.styl';

const SubMenu = Menu.SubMenu;
const Item = Menu.Item;
// const MenuItemGroup = Menu.ItemGroup;

export default class LeftMenu extends Component {
    state = {theme: 'dark'}
    handleClick = (e) => {
        hashHistory.push(e.key);
    }
    changeTheme = (e) => {
        if (e.shiftKey) {
            this.setState({
                theme: this.state.theme === 'dark' ? 'light' : 'dark'
            });
        }
    }
    render () {
        return (
            <Menu onClick={this.handleClick}
                theme={this.state.theme}
                mode='inline'
                defaultOpenKeys={['sub1']}
                className={style.menu}
                selectedKeys={[this.props.pathname]}
                >
                <Item key='/'>
                    <Icon
                        type='home'
                        onClick={this.changeTheme}
                    />
                    <span>主页</span>
                </Item>

                <SubMenu
                    key='sub1'
                    title={<span><Icon type='setting' />文章</span>}
                >
                    <Item key='/editor'>
                        <Icon type='edit' />
                        <span>新建文章</span>
                    </Item>

                    <Item key='/articles'>
                        <Icon type='switcher' />
                        <span>文章管理</span>
                    </Item>
                </SubMenu>

                <SubMenu
                    key='sub2'
                    title={<span><Icon type='setting' />管理员</span>}
                >
                    <Item key='/admin/articles'>
                        <Icon type='switcher' />
                        <span>文章管理</span>
                    </Item>
                    <Item key='/admin/users'>
                        <Icon type='team' />
                        <span>用户管理</span>
                    </Item>
                    <Item key='/github'>
                        <Icon type='github' />
                        <span>GitHub</span>
                    </Item>
                    <Item key='/console'>
                        <Icon type='link' />
                        <span>Console</span>
                    </Item>
                </SubMenu>

                <Item key='/signin'>
                    <Icon type='logout' />
                    <span>登出</span>
                </Item>
            </Menu>
        );
    }
}

