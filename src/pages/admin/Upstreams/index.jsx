import React, {Component} from 'react';
// import {Link} from 'react-router';
import {uniqBy} from 'lodash';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as actions from 'reducers/upstreams';
import Page from 'components/Page';
import CreateModal from './CreateModal';
import {Button, Table, Icon, Tag, Layout} from 'antd';
import style from './style.styl';
import {platformsById} from 'lib/platforms';

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
            const platform = platformsById[item.platform];
            return {
                text: platform.name,
                value: platform.id
            };
        });
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
                            pagination={false}
                            dataSource={this.props.upstreams}
                            // scroll={{y: 'calc(100vh - 55px)'}}
                        >
                            <Column
                                title='昵称'
                                width='20%'
                                dataIndex='nickname'
                                key='nickname'
                            />
                            <Column
                                title='账号'
                                width='25%'
                                dataIndex='account'
                                key='account'
                                render={(text, record) => {
                                    // return <Link to={`/admin/upstreams/${record.id}`}>{text}</Link>;
                                    return <a>{text}</a>;
                                }}
                            />
                            <Column
                                title='平台'
                                width='20%'
                                dataIndex='platform'
                                key='platform'
                                filters={platforms}
                                onFilter={(value, record) => record.platform.includes(value)}
                                render={(text, record) => {
                                    return <Tag>{platformsById[text].name}</Tag>;
                                }}
                            />
                            <Column
                                title='备注'
                                key='custom'
                                dataIndex='custom'
                                width='25%'
                            />
                            <Column
                                title='操作'
                                key='action'
                                render={(_, record) => (
                                    <Button disabled type='danger' shape='circle' size='small'>
                                        <Icon type='delete' />
                                    </Button>
                                )}
                            />
                        </Table>
                    </Layout.Content>
                </Layout>
            </Page>
        );
    }
}

export default AdminUsers;
