import React, {Component} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as actions from 'reducers/upstreams';
import Page from 'components/Page';
import CreateModal from './CreateModal';
import {Button, Table, Icon} from 'antd';
import style from './style.styl';

const {Column} = Table;

const mapStateToProps = state => {
    return {
        upstreams: state.upstreams.data.upstreams
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
        const platforms = this.props.upstreams.map(item => {
            return {
                text: item.platform,
                value: item.platform
            };
        });
        return (
            <Page className={style.container}>
                <Table
                    rowKey='id'
                    dataSource={this.props.upstreams}
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
