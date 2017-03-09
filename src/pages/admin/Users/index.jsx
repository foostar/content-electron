import React, {Component} from 'react';
import moment from 'moment';
import Page from 'components/Page';
import style from './style.styl';
import {connect} from 'react-redux';
import {uniqBy} from 'lodash';
import {bindActionCreators} from 'redux';
import * as usersActions from 'reducers/users';
import * as upstreamsActions from 'reducers/upstreams';
import {platformsById} from 'lib/platforms';

import {Table, Tag, Layout} from 'antd';
import CreateModal from './CreateModal';
import ModifyModal from './ModifyModal';

const {Column} = Table;

const mapStateToProps = state => {
    return {
        users: state.users.data,
        count: state.users.count,
        skip: state.users.skip,
        upstreams: state.upstreams.data
    };
};
const mapDispatchToProps = dispatch => {
    return {
        userActions: bindActionCreators(usersActions, dispatch),
        upstreamsActions: bindActionCreators(upstreamsActions, dispatch)
    };
};

@connect(mapStateToProps, mapDispatchToProps)
class AdminUsers extends Component {
    static defaultProps = {
        users: [],
        upstreams: []
    }
    state = {
        limit: 20
    }
    componentDidMount () {
        this.props.upstreamsActions.fetchUpstreams();
        if (this.props.users.length === 0) {
            this.fetchUsers(1);
        }
    }
    fetchUsers = (page = 1) => {
        this.props.userActions.fetchUsers({
            query: {
                skip: (page - 1) * this.state.limit,
                limit: this.state.limit
            }
        });
    }
    renderUpstreamsByIds = (ids) => {
        if (ids.length === 0) return <Tag>无</Tag>;
        return (
            <div>
                {this.props.upstreams
                    .filter(item => ids.includes(item.id))
                    .map(item =>
                        <div key={item.id} className={style['bind-upstream-tag']}>
                            <Tag
                                key={item.id}
                            >
                                [{platformsById[item.platform].name}] {item.nickname}
                            </Tag>
                        </div>
                    )
                }
            </div>
        );
    }
    render () {
        const userTypes = uniqBy(this.props.users, 'level').map(user => {
            return {
                text: getLevelLabel(user.level),
                value: user.level
            };
        });
        const upstreamTypes = uniqBy(this.props.upstreams, 'platform')
            .map(upstream => {
                return {
                    text: platformsById[upstream.platform].name,
                    value: upstream.id
                };
            })
            .concat({
                text: '无',
                value: 'null'
            });

        const pagination = {
            current: ~~(this.props.skip / this.state.limit) + 1,
            total: this.props.count,
            onChange: this.fetchUsers,
            pageSize: this.state.limit,
            showSizeChanger: true,
            onShowSizeChange: (current, limit) => {
                this.setState({limit}, this.fetchUsers);
            }
        };
        return (
            <Page className={style.container}>
                <Layout className={style.layout}>
                    <Layout.Header className={style.header}>
                        <CreateModal />
                    </Layout.Header>
                    <Layout.Content className={style.content}>
                        <Table
                            bordered
                            rowKey='id'
                            pagination={pagination}
                            dataSource={this.props.users}
                        >
                            <Column
                                key='username'
                                title='用户名'
                                width='15%'
                                dataIndex='username'
                                // render={username => <a>{username}</a>}
                            />
                            <Column
                                key='level'
                                title='用户类型'
                                width='15%'
                                dataIndex='level'
                                filterMultiple={false}
                                filters={userTypes}
                                sorter={(a, b) => a.level - b.level}
                                onFilter={(value, record) => Number(record.level) === Number(value)}
                                render={level => {
                                    if (level > 1) {
                                        return <Tag color='pink'>{getLevelLabel(level)}</Tag>;
                                    }
                                    return <Tag color='green'>{getLevelLabel(level)}</Tag>;
                                }}
                            />
                            <Column
                                key='bindUpstreams'
                                title='绑定的上游账号'
                                width='30%'
                                dataIndex='bindUpstreams'
                                filters={upstreamTypes}
                                sorter={(a, b) => a.bindUpstreams.length - b.bindUpstreams.length}
                                onFilter={(value, record) => {
                                    if (value === 'null' && record.bindUpstreams.length === 0) {
                                        return true;
                                    }
                                    return record.bindUpstreams.includes(value);
                                }}
                                render={this.renderUpstreamsByIds}
                            />
                            <Column
                                key='createdAt'
                                title='创建时间'
                                width='20%'
                                dataIndex='createdAt'
                                sorter={(a, b) => new Date(a.createdAt) - new Date(b.createdAt)}
                                render={time => moment(time).format('YYYY-MM-DD HH:mm')}
                            />
                            <Column
                                key='action'
                                title='操作'
                                width='10%'
                                render={(_, record) => <ModifyModal data={record} />}
                            />
                        </Table>
                    </Layout.Content>
                </Layout>
            </Page>
        );
    }
}

function getLevelLabel (level) {
    switch (level) {
        case 0: return '管理员';
        case 1: return '作者';
        case 2: return '编辑';
    }
}

export default AdminUsers;
