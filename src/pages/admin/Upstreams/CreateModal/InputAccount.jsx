import React, {Component} from 'react';
import {Form, Input, Button, Layout} from 'antd';

import style from './style.styl';
import {platformsById} from 'lib/platforms';

const FormItem = Form.Item;

@Form.create()
class InputAccount extends Component {
    onSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields(async (err, values) => {
            if (err) return;
            this.props.nextStep(values);
            // const {account, password} = values;
            // const platform = new platformsById[this.props.data.platform].Class(account, password);
            // try {
            //     const data = await platform.login();
            //     console.log(data);
            //     this.props.nextStep(data);
            // } catch (err) {
            //     console.log(err);
            // }
        });
    }
    render () {
        const {getFieldDecorator} = this.props.form;
        const platformId = this.props.data.platform;
        const platform = platformsById[platformId];
        return (
            <Form className={style['account-form']} onSubmit={this.onSubmit}>
                <Layout className={style['account-form-wrapper']}>
                    <Layout.Header className={style.header} />
                    <Layout className={style['content-container']}>
                        <Layout.Sider className={style.sider} width='150'>
                            <img src={platform.logo} />
                        </Layout.Sider>
                        <Layout.Content className={style.content}>
                            <FormItem>
                                {getFieldDecorator('account', {
                                    initialValue: '17600806970',
                                    // initialValue: 'mameiling@goyoo.com',
                                    rules: [{required: true, message: '请输入账号!'}]
                                })(
                                    <Input placeholder='账号' />
                                )}
                            </FormItem>
                            <FormItem>
                                {getFieldDecorator('password', {
                                    initialValue: 'zxc123456',
                                    rules: [{required: true, message: '请输入密码!'}]
                                })(
                                    <Input placeholder='密码' />
                                )}
                            </FormItem>
                            <FormItem>
                                {getFieldDecorator('custom', {
                                    // rules: [{required: true, message: `输入 ${platform} 昵称!`}]
                                })(
                                    <Input placeholder='备注(可留空)' />
                                )}
                            </FormItem>
                        </Layout.Content>
                    </Layout>
                    <Layout.Footer>
                        <Button type='primary' size='large' htmlType='submit'>
                            下一步
                        </Button>
                    </Layout.Footer>
                </Layout>
            </Form>
        );
    }
}

export default InputAccount;
