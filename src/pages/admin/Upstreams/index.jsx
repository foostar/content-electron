import React, {Component} from 'react';
// import {Link} from 'react-router';
import {uniqBy} from 'lodash';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as actions from 'reducers/upstreams';
import Page from 'components/Page';
import CreateModal from './CreateModal';
import {Button, Table, Icon, Tag} from 'antd';
import style from './style.styl';

const {Column} = Table;

const mapStateToProps = state => {
    return {
        upstreams: state.upstreams.data
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
        upstreams: []
    }
    componentDidMount () {
        this.props.actions.fetchUpstreams();
    }
    render () {
        const platforms = uniqBy(this.props.upstreams, 'platform').map(item => {
            return {
                text: item.platform,
                value: item.platform
            };
        });
        return (
            <Page className={style.container}>
                <Table
                    rowKey='id'
                    pagination={false}
                    dataSource={this.props.upstreams}
                    scroll={{y: 'calc(100vh - 55px)'}}
                >
                    <Column
                        title='账号'
                        width='40%'
                        dataIndex='account'
                        key='account'
                        render={(text, record) => {
                            // return <Link to={`/admin/upstreams/${record.id}`}>{text}</Link>;
                            return <a>{text}</a>;
                        }}
                    />
                    <Column
                        title='平台'
                        width='40%'
                        dataIndex='platform'
                        key='platform'
                        filters={platforms}
                        onFilter={(value, record) => record.platform.includes(value)}
                        render={(text, record) => {
                            if (record.platform === '企鹅号') {
                                return <Tag color='purple'>{text}</Tag>;
                            }
                            return <Tag color='blue'>{text}</Tag>;
                        }}
                    />
                    <Column
                        title={<CreateModal />}
                        width='20%'
                        key='action'
                        render={(_, record) => (
                            <Button disabled type='danger' shape='circle' size='small'>
                                <Icon type='delete' />
                            </Button>
                        )}
                    />
                </Table>
            </Page>
        );
    }
}

export default AdminUsers;
