import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as usersActions from 'reducers/users';
import * as upstreamsActions from 'reducers/upstreams';
import {platformsById} from 'utils/consts';

import {
    Modal, Button, Form, Input,
    Radio, Select, Alert, message
} from 'antd';

const FormItem = Form.Item;
const {Option} = Select;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

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
class ModifyModal extends Component {
    state = {
        visible: false
    }
    showModal = () => {
        this.props.upstreamsActions.fetchUpstreams();
        this.setState({visible: true});
    }
    onCancel = () => {
        this.setState({visible: false});
    }
    handleSubmit = (e) => {
        this.props.form.validateFields(async (err, values) => {
            if (err) return;

            if (!values.password) {
                delete values.password;
            }
            const {type} = await this.props.userActions.updateUser({
                body: values,
                params: {
                    id: this.props.data.id
                }
            });

            if (type === 'UPDATE_USER_SUCCESS') {
                this.setState({visible: false});
                this.props.userActions.fetchUsers(); // 更新用户列表
                if (values.password) {
                    Modal.success({
                        title: '修改成功',
                        width: 520,
                        content: (
                            <div>
                                <Alert message={(
                                    <div>
                                        <p>账号: {this.props.data.username}</p>
                                        <p>密码: {values.password}</p>
                                    </div>
                                )} />
                                <Alert message='注意: 密码无法查询, 只能修改, 请做好记录!' type='error' />
                            </div>
                        )
                    });
                } else {
                    message.success('修改成功!');
                }
            }
        });
    }
    afterClose = () => {
        this.props.form.resetFields();
    }
    renderForm () {
        const {getFieldDecorator} = this.props.form;
        const {username, level, bindUpstreams} = this.props.data;
        return (
            <Form onSubmit={this.handleSubmit}>
                <FormItem label='用户类型' labelCol={{span: 5}} wrapperCol={{span: 17}}>
                    <RadioGroup value={level} disabled>
                        <RadioButton value={1}>内容提供</RadioButton>
                        <RadioButton value={2}>小云小编</RadioButton>
                    </RadioGroup>
                </FormItem>

                <FormItem label='账号' labelCol={{span: 5}} wrapperCol={{span: 17}}>
                    <Input placeholder='账号' value={username} disabled />
                </FormItem>

                <FormItem label='密码' labelCol={{span: 5}} wrapperCol={{span: 17}}>
                    {getFieldDecorator('password')(
                        <Input placeholder='不修改密码的话请不要填写' />
                    )}
                </FormItem>

                <FormItem label='绑定平台账号' labelCol={{span: 5}} wrapperCol={{span: 17}}>
                    {getFieldDecorator('bindUpstreams', {
                        initialValue: bindUpstreams
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
                    type='warning'
                    size='small'
                    shape='circle'
                    icon='edit'
                    onClick={this.showModal}
                />
                <Modal
                    title='修改用户'
                    okText='修改'
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

export default ModifyModal;
