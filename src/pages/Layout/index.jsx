import React, {Component} from 'react';
import {Link} from 'react-router';
import {Button} from 'antd';
import style from './style.styl';

export default class extends Component {
    render () {
        return (
            <div className={style.container}>
                <nav>
                    <Link to='/' activeClassName='active'>
                        <Button>Home</Button>
                    </Link>
                    <Link to='/article'>
                        <Button>Article</Button>
                    </Link>
                </nav>
                <div className={style.content}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

