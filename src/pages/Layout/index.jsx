import React, {Component} from 'react';
import ReactCSSTransitionGroup from 'react/lib/ReactCSSTransitionGroup';
import LeftMenu from './LeftMenu';
import style from './style.styl';

// const mapStateToProps = state => {
//     return {
//         platforms: state.platforms
//     };
// };
// const mapDispatchToProps = dispatch => {
//     return {
//         actions: bindActionCreators(actions, dispatch)
//     };
// };
// @connect(mapStateToProps, mapDispatchToProps)

export default class Layout extends Component {
    // componentDidMount () {
    //     this.props.actions.fetchPlatforms();
    // }

    render () {
        const {location} = this.props;
        return (
            <div className={style.container}>
                <LeftMenu location={location} />
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
                                {key: location.pathname}
                            )
                        }
                    </ReactCSSTransitionGroup>
                </div>
            </div>
        );
    }
}
