import React, {Component} from 'react';
import {Link} from 'react-router';
import {Button} from 'antd';
import logo from '../../images/xiaoyun-logo@2x.png';
import style from './style.styl';

export default class extends Component {
    render () {
        return (
            <div className={style.container}>
                <header className={style.header}>
                    <img className={style.logo} src={logo} alt='小云' />
                    <nav className={style.nav}>
                        <Link to='/' activeClassName='active'>
                            <Button>Home</Button>
                        </Link>
                        <Link to='/article'>
                            <Button>Article</Button>
                        </Link>
                    </nav>
                    <div className={style.loginBox}>Hello World!</div>
                </header>
                <div className={style.content}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

