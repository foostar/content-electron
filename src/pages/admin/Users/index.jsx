import React, {Component} from 'react';
import moment from 'moment';
import Page from 'components/Page';
import style from './style.styl';
import {connect} from 'react-redux';
import {uniqBy} from 'lodash';
import {bindActionCreators} from 'redux';
import * as actions from 'reducers/users';
import {Table, Button, Tag} from 'antd';
import CreateModal from './CreateModal';

const {Column} = Table;

const mapStateToProps = state => {
    return {
        users: state.users.data
    };
};
const mapDispatchToProps = dispatch => {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
};

@connect(mapStateToProps, mapDispatchToProps)
class AdminUsers extends Component {
    static defaultProps = {
        users: []
    }
    componentDidMount () {
        this.props.actions.fetchUsers();
    }
    render () {
        const userTypes = uniqBy(this.props.users, 'level').map(user => {
            return {
                text: getLevelLabel(user.level),
                value: user.level
            };
        });
        console.log(userTypes);
        return (
            <Page className={style.container}>
                <Table
                    pagination={false}
                    rowKey='id'
                    dataSource={this.props.users}
                    scroll={{y: 'calc(100vh - 55px)'}}
                >
                    <Column
                        key='username'
                        title='用户名'
                        dataIndex='username'
                        width='30%'
                        render={username => <a>{username}</a>}
                    />
                    <Column
                        key='level'
                        title='用户类型'
                        dataIndex='level'
                        width='25%'
                        filterMultiple={false}
                        filters={userTypes}
                        sorter={(a, b) => a.level - b.level}
                        onFilter={(value, record) => Number(record.level) === Number(value)}
                        render={level => {
                            if (level > 1) {
                                return <Tag color='red-inverse'>{getLevelLabel(level)}</Tag>;
                            }
                            return <Tag color='blue-inverse'>{getLevelLabel(level)}</Tag>;
                        }}
                    />
                    <Column
                        key='createdAt'
                        title='创建时间'
                        width='30%'
                        dataIndex='createdAt'
                        sorter={(a, b) => new Date(a.createdAt) - new Date(b.createdAt)}
                        render={time => moment(time).format('YYYY-MM-DD HH:mm')}
                    />
                    <Column
                        key='action'
                        width='15%'
                        title={<CreateModal />}
                        render={() => <Button disabled size='small' shape='circle' icon='edit' />}
                    />
                </Table>
            </Page>
        );
    }
}

function getLevelLabel (level) {
    switch (level) {
        case 0: return '超级管理员';
        case 1: return '内容贡献者';
        case 2: return '小云编辑';
    }
}

export default AdminUsers;
