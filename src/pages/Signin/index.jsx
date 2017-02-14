import React, {Component} from 'react';
import {Form, Icon, Input, Button, message} from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {hashHistory} from 'react-router';
import * as actions from 'reducers/passport';

import style from './style.styl';

const FormItem = Form.Item;

const mapStateToProps = state => {
    return {
        passport: state.passport
    };
};
const mapDispatchToProps = dispatch => {
    return bindActionCreators(actions, dispatch);
};

@connect(mapStateToProps, mapDispatchToProps)
@Form.create()
export default class extends Component {
    componentDidMount () {
        message.info(JSON.stringify(this.props.passport));
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields(async (err, values) => {
            if (err) return;
            const {username, password} = values;
            const res = await this.props.signin({
                body: {username, password}
            });
            console.log(res);
            if (res.type === 'SIGN_IN_SUCCESS') {
                hashHistory.replace('/');
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

