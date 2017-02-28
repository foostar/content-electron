import React, {Component} from 'react';
import {Form, Icon, Input, Button} from 'antd';

import style from './style.styl';

const FormItem = Form.Item;

@Form.create()
class InputAccount extends Component {
    onSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) return;
            this.props.nextStep(values);
        });
    }
    render () {
        const {getFieldDecorator} = this.props.form;
        const {platform} = this.props.data;
        return (
            <div className={style['account-form-wrapper']}>
                <Form className={style['account-form']} onSubmit={this.onSubmit}>
                    <FormItem>
                        {getFieldDecorator('account', {
                            // initialValue: 'mameiling@goyoo.com',
                            rules: [{required: true, message: `输入 ${platform} 账号!`}]
                        })(
                            <Input addonBefore={<Icon type='user' />} placeholder={`${platform} 账号`} />
                        )}
                    </FormItem>

                    <FormItem>
                        {getFieldDecorator('password', {
                            // initialValue: 'zxc123456',
                            rules: [{required: true, message: `输入 ${platform} 密码!`}]
                        })(
                            <Input addonBefore={<Icon type='lock' />} placeholder={`${platform} 密码`} />
                        )}
                    </FormItem>

                    <FormItem>
                        {getFieldDecorator('custom', {
                            // rules: [{required: true, message: `输入 ${platform} 昵称!`}]
                        })(
                            <Input addonBefore={<Icon type='book' />} placeholder='备注' />
                        )}
                    </FormItem>

                    <FormItem>
                        <Button type='primary' size='large' htmlType='submit'>
                            下一步
                        </Button>
                    </FormItem>
                </Form>
            </div>
        );
    }
}

export default InputAccount;
