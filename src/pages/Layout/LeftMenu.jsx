import React, {Component} from 'react';
import {hashHistory} from 'react-router';
import { Menu, Icon } from 'antd';

import style from './style.styl';

const SubMenu = Menu.SubMenu;
const Item = Menu.Item;
// const MenuItemGroup = Menu.ItemGroup;

export default class LeftMenu extends Component {
    handleClick = (e) => {
        hashHistory.push(e.key);
    }
    render () {
        return (
            <Menu onClick={this.handleClick}
                theme='dark'
                mode='inline'
                defaultOpenKeys={['sub']}
                className={style.menu}
                selectedKeys={[this.props.pathname]}
                >
                <Item key='/'>
                    <Icon type='home' />
                    <span>主页</span>
                </Item>

                <Item key='/articles'>
                    <Icon type='switcher' />
                    <span>文章管理</span>
                </Item>

                <SubMenu
                    key='sub'
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

