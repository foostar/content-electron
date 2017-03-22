import React, {Component} from 'react';
import {hashHistory} from 'react-router';
import {Menu, Icon} from 'antd';
import style from './style.styl';
import {connect} from 'react-redux';

// const SubMenu = Menu.SubMenu;
const Item = Menu.Item;
const MenuItemGroup = Menu.ItemGroup;

const mapStateToProps = state => {
    return {
        passport: state.passport.data
    };
};

@connect(mapStateToProps)
export default class LeftMenu extends Component {
    state = {theme: 'light'}
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
        const {level} = this.props.passport;
        return (
            <Menu
                mode='inline'
                className={style.menu}
                theme={this.state.theme}
                onClick={this.handleClick}
                selectedKeys={[this.props.location.pathname]}
                defaultOpenKeys={['test-sub']}
            >
                <MenuItemGroup title={
                    <div onClick={this.changeTheme}>
                        <span><Icon type='cloud' />&emsp;小云</span>
                    </div>
                }>
                    <Item key='/'>
                        <Icon type='home' />
                        <span>主页</span>
                    </Item>
                    <Item key='/editor'>
                        <Icon type='edit' />
                        <span>新建内容</span>
                    </Item>

                    <Item key='/articles'>
                        <Icon type='copy' />
                        <span>内容列表</span>
                    </Item>
                </MenuItemGroup>

                {/* admin 权限 */}
                {(level === 0 || level > 1) &&
                    <MenuItemGroup title={<span><Icon type='ellipsis' />&emsp;admin</span>}>
                        <Item key='/admin/upstreams'>
                            <Icon type='cloud-upload-o' />
                            <span>上游账号</span>
                        </Item>
                        <Item key='/admin/users'>
                            <Icon type='team' />
                            <span>用户管理</span>
                        </Item>
                        <Item key='/admin/articles'>
                            <Icon type='book' />
                            <span>内容管理</span>
                        </Item>
                    </MenuItemGroup>
                }

                {/*
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
                */}

                <Item key='/signin'>
                    <Icon type='logout' />
                    <span>登出</span>
                </Item>
            </Menu>
        );
    }
}

