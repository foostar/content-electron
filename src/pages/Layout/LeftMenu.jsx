import React, {Component} from 'react';
import {hashHistory} from 'react-router';
import { Menu, Icon } from 'antd';
import style from './style.styl';

const SubMenu = Menu.SubMenu;
const Item = Menu.Item;
const MenuItemGroup = Menu.ItemGroup;

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
            <Menu
                mode='inline'
                className={style.menu}
                theme={this.state.theme}
                onClick={this.handleClick}
                selectedKeys={[this.props.location.pathname]}
                defaultOpenKeys={['platfrom-sub', 'test-sub']}
            >
                <MenuItemGroup title={
                    <div onClick={this.changeTheme}>
                        <Icon type='cloud' />&emsp;小云
                    </div>
                }>
                    <Item key='/'>
                        <Icon type='home' />
                        <span>主页</span>
                    </Item>
                    <Item key='/editor'>
                        <Icon type='edit' />
                        <span>新建文章</span>
                    </Item>

                    <Item key='/articles'>
                        <Icon type='switcher' />
                        <span>文章管理</span>
                    </Item>
                </MenuItemGroup>

                <MenuItemGroup title={<Icon type='ellipsis' />}>
                    <Item key='/admin/articles'>
                        <Icon type='switcher' />
                        <span>文章管理</span>
                    </Item>
                    <Item key='/admin/users'>
                        <Icon type='team' />
                        <span>用户管理</span>
                    </Item>

                    <SubMenu
                        key='platfrom-sub'
                        title={<div><Icon type='share-alt' /><span>平台管理</span></div>}
                    >
                        <Item key='/admin/platfrom/qi_e'>
                            <i className='fa fa-qq' style={{marginRight: 8}} />
                            企鹅号
                        </Item>
                        <Item key='/admin/platfrom/bai_jia'>
                            <i className='fa fa-paw' style={{marginRight: 8}} />
                            百家号
                        </Item>
                    </SubMenu>
                </MenuItemGroup>

                <SubMenu
                    key='test-sub'
                    title={<span><Icon type='setting' />测试</span>}
                >
                    <Item key='/github'>
                        <Icon type='github' />
                        <span>GitHub</span>
                    </Item>
                    <Item key='/console'>
                        <Icon type='link' />
                        <span>Console</span>
                    </Item>
                    <Item key='/console2'>
                        <Icon type='link' />
                        <span>Console2</span>
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

