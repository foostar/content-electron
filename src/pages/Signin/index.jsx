import React, {Component} from 'react';
import {Form, Icon, Input, Button, message} from 'antd';

import style from './style.styl';

const FormItem = Form.Item;

@Form.create()
export default class extends Component {
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                message.info(`username: ${values.username}, password: ${values.password}`);
                console.log('Received values of form: ', values);
            }
        });
    }
    render () {
        const {getFieldDecorator} = this.props.form;
        return (
            <Form onSubmit={this.handleSubmit} className={style['login-form']}>
                <FormItem>
                    {getFieldDecorator('username', {
                        rules: [{ required: true, message: '请输入账号!' }]
                    })(
                        <Input addonBefore={<Icon type='user' />} placeholder='账号' />
                    )}
                </FormItem>

                <FormItem>
                    {getFieldDecorator('password', {
                        rules: [{ required: true, message: '请输入密码!' }]
                    })(
                        <Input addonBefore={<Icon type='lock' />} type='password' placeholder='密码' />
                     )}
                </FormItem>

                <FormItem>
                    <Button type='primary' htmlType='submit' style={{width: '100%'}}>
                        登录
                    </Button>
                </FormItem>
            </Form>
        );
    }
}

