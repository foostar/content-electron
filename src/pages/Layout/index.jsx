import React, {Component} from 'react';
import ReactCSSTransitionGroup from 'react/lib/ReactCSSTransitionGroup';
import {hashHistory} from 'react-router';

import { Menu, Icon } from 'antd';
const SubMenu = Menu.SubMenu;
// const MenuItemGroup = Menu.ItemGroup;
const Item = Menu.Item;

import style from './style.styl';

export default class Layout extends Component {
    handleClick = (e) => {
        hashHistory.push(e.key);
    }
    render () {
        return (
            <div className={style.container}>
                <Menu onClick={this.handleClick}
                    theme='dark'
                    mode='inline'
                    // defaultOpenKeys={['sub1', 'sub2']}
                    style={{ width: 240, height: '100%' }}
                    selectedKeys={[this.props.location.pathname]}
                >
                    <Item key='/'>
                        <Icon type='home' />
                        <span>主页</span>
                    </Item>

                    <Item key='/articles'>
                        <Icon type='edit' />
                        <span>写文章</span>
                    </Item>

                    <SubMenu key='sub' title={<span><Icon type='setting' />其他</span>}>
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
                <div className={style.content}>
                    <ReactCSSTransitionGroup
                        transitionName='change-route'
                        transitionEnterTimeout={500}
                        transitionLeave={false}
                    >
                        {
                            React.cloneElement(
                                this.props.children,
                                {key: this.props.location.pathname}
                            )
                        }
                    </ReactCSSTransitionGroup>
                </div>
            </div>
        );
    }
}
