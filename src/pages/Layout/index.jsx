import React, {Component} from 'react';
import ReactCSSTransitionGroup from 'react/lib/ReactCSSTransitionGroup';
import LeftMenu from './LeftMenu';
// import logo from '../../images/xiaoyun-logo@2x.png';
import style from './style.styl';

export default class Layout extends Component {
    render () {
        const {pathname} = this.props.location;
        return (
            <div className={style.container}>
                <LeftMenu pathname={pathname} />
                <div className={style.content}>
                    <ReactCSSTransitionGroup
                        component='main'
                        className={style.inner}
                        transitionName='change-route'
                        transitionEnterTimeout={300}
                        transitionLeaveTimeout={300}
                    >
                        {
                            React.cloneElement(
                                this.props.children,
                                {key: pathname}
                            )
                        }
                    </ReactCSSTransitionGroup>
                </div>
            </div>
        );
    }
}
