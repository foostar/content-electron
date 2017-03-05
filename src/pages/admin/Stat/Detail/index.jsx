import React, {Component} from 'react';
import * as upstreamsActions from 'reducers/upstreams';
import * as reproductionActions from 'reducers/reproduction';
import * as usersActions from 'reducers/users';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {platformsById} from 'lib/platforms';

const mapStateToProps = (state, props) => {
    const upsId = props.params.id;
    const upstream = state.upstreams.data.find(u => u.id === upsId);
    const users = state.users.data;
    return {
        users,
        upstream,
        statByUpstream: state.reproduction.upstream
    };
};
const mapDispatchToProps = dispatch => {
    return {
        usersActions: bindActionCreators(usersActions, dispatch),
        upstreamsActions: bindActionCreators(upstreamsActions, dispatch),
        reproductionActions: bindActionCreators(reproductionActions, dispatch)
    };
};

@connect(mapStateToProps, mapDispatchToProps)
class StatDetail extends Component {
    state = {
        data: []
    }
    async componentDidMount () {
        if (!this.props.upstream) {
            this.props.upstreamsActions.fetchUpstreams();
        };

        if (this.props.users.length === 0) {
            this.props.usersActions.fetchUsers();
        }

        const res = await this.props.reproductionActions.fetchStatWithUpstreams({
            query: {
                groupBy: 'publisher',
                upstreams: this.props.params.id
            }
        });
        this.setState({
            data: res.payload.result.data
        });
    }
    render () {
        const {nickname, platform} = this.props.upstream || {};
        return (
            <div>
                <h1>[{(platformsById[platform] || {}).name}] {nickname}</h1>

                {this.state.data.map((item, idx) => {
                    const publisher = this.props.users.find(u => u.id === item.publisher) || {
                        username: '管理员'
                    };
                    return (
                        <div key={idx}>
                            <h3>{publisher.username}</h3>
                            <span>[产生PV]: {item.total}</span>
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default StatDetail;
