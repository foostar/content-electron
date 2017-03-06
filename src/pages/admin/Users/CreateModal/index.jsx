import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as usersActions from 'reducers/users';
import * as upstreamsActions from 'reducers/upstreams';
import {platformsById} from 'lib/platforms';

import {
    Modal, Button, Form, Input,
    Radio, Select, Alert
} from 'antd';

const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const {Option} = Select;

const mapStateToProps = state => {
    return {
        upstreams: state.upstreams.data,
        skip: state.upstreams.skip,
        count: state.upstreams.count
    };
};

const mapDispatchToProps = dispatch => {
    return {
        userActions: bindActionCreators(usersActions, dispatch),
        upstreamsActions: bindActionCreators(upstreamsActions, dispatch)
    };
};

@Form.create()
@connect(mapStateToProps, mapDispatchToProps)
class CreateModal extends Component {
    static defaultProps = {
        upstreams: []
    }
    state = {
        visible: false
    }
    handleSubmit = (e) => {
        this.props.form.validateFields(async (err, values) => {
            if (err) return;

            const {type} = await this.props.userActions.createUser({
                body: values
            });

            if (type === 'CREATE_USER_SUCCESS') {
                this.setState({visible: false});
                this.props.userActions.fetchUsers(); // 更新用户列表
                Modal.success({
                    title: '创建成功',
                    width: 520,
                    content: (
                        <div>
                            <Alert message={(
                                <div>
                                    <p>账号: {values.username}</p>
                                    <p>密码: {values.password}</p>
                                </div>
                            )} />
                            <Alert message='注意: 密码无法查询, 只能修改, 请做好记录!' type='error' />
                        </div>
                    )
                });
            }
        });
    }
    showModal = () => {
        this.props.upstreamsActions.fetchUpstreams();
        this.setState({visible: true});
    }
    onCancel = () => {
        this.setState({visible: false});
    }
    afterClose = () => {
        this.props.form.resetFields();
    }
    renderForm () {
        const {getFieldDecorator} = this.props.form;

        return (
            <Form onSubmit={this.handleSubmit}>
                <FormItem label='用户类型' labelCol={{span: 5}} wrapperCol={{span: 17}}>
                    {getFieldDecorator('level', {
                        initialValue: 1,
                        rules: [{required: true, message: '请选择账户类型!'}]
                    })(
                        <RadioGroup>
                            <RadioButton value={1}>内容提供</RadioButton>
                            <RadioButton value={2}>小云小编</RadioButton>
                        </RadioGroup>
                        )}
                </FormItem>

                <FormItem label='账号' labelCol={{span: 5}} wrapperCol={{span: 17}}>
                    {getFieldDecorator('username', {
                        rules: [{required: true, message: '请输入账号!'}]
                    })(
                        <Input placeholder='账号' />
                        )}
                </FormItem>

                <FormItem label='密码' labelCol={{span: 5}} wrapperCol={{span: 17}}>
                    {getFieldDecorator('password', {
                        initialValue: '123456',
                        rules: [{required: true, message: '请输入密码!'}]
                    })(
                        <Input placeholder='密码' />
                        )}
                </FormItem>

                <FormItem label='绑定平台账号' labelCol={{span: 5}} wrapperCol={{span: 17}}>
                    {getFieldDecorator('bindUpstreams', {
                        initialValue: []
                    })(
                        <Select
                            multiple
                            style={{width: '100%'}}
                            placeholder='请选择平台账号'
                        >
                            {this.props.upstreams.map(item =>
                                <Option key={item.id}>
                                    [{platformsById[item.platform].name}] {item.nickname}
                                </Option>
                            )}

                        </Select>
                        )}
                </FormItem>
            </Form>
        );
    }
    render () {
        return (
            <div>
                <Button
                    icon='plus'
                    onClick={this.showModal}
                >
                    添加新用户
                </Button>

                <Modal
                    title='创建用户'
                    okText='创建'
                    visible={this.state.visible}
                    onOk={this.handleSubmit}
                    onCancel={this.onCancel}
                    afterClose={this.afterClose}
                >
                    {this.renderForm()}
                </Modal>
            </div>
        );
    }
}

export default CreateModal;
