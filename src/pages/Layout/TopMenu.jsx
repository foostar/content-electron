import React, {Component} from 'react';
import {Link} from 'react-router';
import {Button} from 'antd';
import style from './style.styl';
import {connect} from 'react-redux';

const mapStateToProps = state => {
    return {
        passport: state.passport.data
    };
};

@connect(mapStateToProps)
export default class TopMenu extends Component {
    render () {
        const menu = [{
            name: '编辑',
            router: '/editor'
        }, {
            name: '我的文章',
            router: '/contents'
        }, {
            name: '平台账号',
            level: l => l === 0,
            router: '/admin/upstreams'
        }, {
            name: '用户',
            level: l => l === 0,
            router: '/admin/users'
        }, {
            name: '内容库',
            level: l => l === 0 || l > 1,
            router: '/admin/contents'
        }, {
            name: '统计',
            level: l => l === 0 || l > 1,
            router: '/admin/stat'
        }].filter(x => !x.level || x.level(this.props.passport.level));
        return (
            <div className={style.menu}>
                {menu.map(x => (
                    <Link activeClassName={style.active} to={x.router} key={x.router}>
                        <Button className={style['menu-btn']} size='large'>{x.name}</Button>
                    </Link>
                ))}
            </div>
        );
    }
}

