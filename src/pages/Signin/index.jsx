import React, {Component} from 'react';
import {Form, Icon, Input, Button} from 'antd';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {hashHistory} from 'react-router';
import * as actions from 'reducers/passport';
import style from './style.styl';
import bgGif from './cat.gif';

const FormItem = Form.Item;

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
@Form.create()
export default class Signin extends Component {
    componentDidMount () {
        this.props.actions.signout();
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields(async (err, values) => {
            if (err) return;
            const {username, password} = values;
            const {type} = await this.props.actions.signin({
                body: {username, password}
            });
            if (type === 'SIGN_IN_SUCCESS') {
                hashHistory.replace('/');
            }
        });
    }
    render () {
        const {getFieldDecorator} = this.props.form;
        return (
            <div className={style.container}>
                <img className={style.bicycle} src={bgGif} />
                <Form onSubmit={this.handleSubmit} className={style['login-form']}>
                    <FormItem>
                        {getFieldDecorator('username', {
                            rules: [{required: true, message: '请输入账号!'}]
                        })(
                            <Input
                                placeholder='账号'
                                addonBefore={<Icon type='user' />}
                            />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('password', {
                            rules: [{required: true, message: '请输入密码!'}]
                        })(
                            <Input
                                type='password'
                                placeholder='密码'
                                addonBefore={<Icon type='lock' />}
                            />
                        )}
                    </FormItem>
                    <FormItem>
                        <Button type='primary' htmlType='submit' style={{width: '100%'}}>
                            登录
                        </Button>
                    </FormItem>
                </Form>
            </div>
        );
    }
}

