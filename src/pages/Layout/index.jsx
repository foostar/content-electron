import React, {Component} from 'react';
// import ReactCSSTransitionGroup from 'react/lib/ReactCSSTransitionGroup';
import LeftMenu from './LeftMenu';
import style from './style.styl';

export default class Layout extends Component {
    render () {
        const {location} = this.props;
        return (
            <div className={style.container}>
                <LeftMenu location={location} />
                <div className={style.content}>
                    <div className={style.inner}>
                        {this.props.children}
                    </div>
                    {/*
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
                                {key: location.pathname}
                            )
                        }
                    </ReactCSSTransitionGroup>
                    */}
                </div>
            </div>
        );
    }
}
