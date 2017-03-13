import React, {Component} from 'react';
// import ReactCSSTransitionGroup from 'react/lib/ReactCSSTransitionGroup';
import Topbar from './Topbar';
import PlatformMananger from 'components/PlatformManager';
import style from './style.styl';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as upstreamsActions from 'reducers/upstreams';
import app from 'lib/app';

const mapStateToProps = (state, props) => {
    return {
        passport: state.passport.data,
        upstreams: state.upstreams.data,
        myBindUpstreams: state.passport.data.bindUpstreams,
        myLevel: state.passport.data.level
    };
};
const mapDispatchToProps = dispatch => {
    return {
        upstreamsActions: bindActionCreators(upstreamsActions, dispatch)
    };
};

@connect(mapStateToProps, mapDispatchToProps)
export default class Layout extends Component {
    componentDidMount () {
        if (!this.props.upstreams.length) {
            this.props.upstreamsActions.fetchUpstreams();
        }
    }
    render () {
        const {location, upstreams, myBindUpstreams} = this.props;
        const myUpstreams = upstreams.filter(upstream => myBindUpstreams.includes(upstream.id));
        return (
            <div className={style.container}>
                <Topbar location={location} />
                <div className={style.content}>
                    <div className={style.inner}>
                        {this.props.children}
                    </div>
                    {myUpstreams.length && (<PlatformMananger ref={(ref) => {
                        if (!ref) return;
                        app.setManager(ref.getWrappedInstance());
                    }} upstreams={myUpstreams} />)}
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
