import React, {Component} from 'react';
import {Modal, Button, Form, Input, Radio, Alert} from 'antd';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as actions from 'reducers/users';

const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const mapDispatchToProps = dispatch => {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
};

@connect(null, mapDispatchToProps)
@Form.create()
class CreateModal extends Component {
    state = {
        visible: false
    }
    handleSubmit = (e) => {
        this.props.form.validateFields(async (err, values) => {
            if (err) return;
            const {type} = await this.props.actions.createUser({
                body: values
            });

            if (type === 'CREATE_USER_SUCCESS') {
                this.setState({visible: false});
                this.props.actions.fetchUsers();
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

                <FormItem label='用户类型' labelCol={{span: 5}} wrapperCol={{span: 17}}>
                    {getFieldDecorator('level', {
                        initialValue: 1,
                        rules: [{required: true, message: '请选择账户类型!'}]
                    })(
                        <RadioGroup>
                            <RadioButton value={1}>内容贡献者</RadioButton>
                            <RadioButton value={2}>小云小编</RadioButton>
                        </RadioGroup>
                    )}
                </FormItem>
            </Form>
        );
    }
    render () {
        return (
            <div>
                <Button
                    type='primary'
                    size='small'
                    shape='circle'
                    icon='plus'
                    onClick={this.showModal}
                />
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
