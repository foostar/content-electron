import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as actions from 'reducers/upstreams';
// import {hashHistory} from 'react-router';

import style from './style.styl';

import {Row, Col, Table, Collapse, Alert, Button, message} from 'antd';
const {Column} = Table;
const {Panel} = Collapse;

const mapStateToProps = state => {
    return {
        passport: state.passport
    };
};
const mapDispatchToProps = dispatch => {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
};

@connect(mapStateToProps, mapDispatchToProps)
class CreateDone extends Component {
    onClick = async (e) => {
        const {createUpstream, fetchUpstreams} = this.props.actions;

        const {type} = await createUpstream({
            body: this.props.data
        });
        if (type === 'CREATE_UPSTREAM_SUCCESS') {
            message.success('更新/创建 Upstream 成功!');
            await fetchUpstreams();
            this.props.nextStep('success');
        }
    }
    render () {
        const {account, session, platform, nickname, custom} = this.props.data;
        return (
            <div className={style['create-done']}>
                <Row gutter={8}>
                    <Col xs={24} md={8}>
                        <Alert type='info' message={`平台: ${platform}`} />
                    </Col>
                    <Col xs={24} md={8}>
                        <Alert type='info' message={`账号: ${account}`} />
                    </Col>
                    <Col xs={24} md={8}>
                        <Alert type='info' message={`昵称: ${nickname}`} />
                    </Col>
                    <Col xs={24} md={8}>
                        <Alert type='info' message={`备注: ${custom}`} />
                    </Col>
                </Row>
                <Collapse>
                    <Panel header='Session'>
                        <Table
                            size='small'
                            rowKey={record => `${record.name}:${record.value}`}
                            pagination={false}
                            dataSource={session}
                        >
                            <Column
                                title='domain'
                                width={120}
                                dataIndex='domain'
                                key='domain'
                            />
                            <Column
                                title='expirationDate'
                                width={140}
                                dataIndex='expirationDate'
                                key='expirationDate'
                            />
                            <Column
                                title='hostOnly'
                                width={80}
                                dataIndex='hostOnly'
                                key='hostOnly'
                                render={text => `${text}`}
                            />
                            <Column
                                title='httpOnly'
                                width={80}
                                dataIndex='httpOnly'
                                key='httpOnly'
                                render={text => `${text}`}
                            />
                            <Column
                                title='name'
                                width={120}
                                dataIndex='name'
                                key='name'
                            />
                            <Column
                                title='path'
                                width={80}
                                dataIndex='path'
                                key='path'
                            />
                            <Column
                                title='secure'
                                width={70}
                                dataIndex='secure'
                                key='secure'
                                render={text => `${text}`}
                            />
                            <Column
                                title='session'
                                width={70}
                                dataIndex='session'
                                key='session'
                                render={text => `${text}`}
                            />
                            <Column
                                title='value'
                                dataIndex='value'
                                key='value'
                            />
                        </Table>
                    </Panel>
                </Collapse>
                <br />
                <Button
                    size='large'
                    type='primary'
                    onClick={this.onClick}
                >
                    保存
                </Button>
            </div>
        );
    }
}

export default CreateDone;
