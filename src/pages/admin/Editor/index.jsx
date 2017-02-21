import React, {Component} from 'react';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {hashHistory, Link} from 'react-router';
import {Form, Button, Spin, Input, Select, notification} from 'antd';
import * as actions from 'reducers/admin/editor';

import Page from 'components/Page';
import style from './style.styl';

import 'froala-editor/js/froala_editor.pkgd.min.js';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'font-awesome/css/font-awesome.css';

import FroalaEditor from 'react-froala-wysiwyg';

const FormItem = Form.Item;
const Option = Select.Option;

const mapStateToProps = state => {
    return {
        editor: state.adminEditor
    };
};
const mapDispatchToProps = dispatch => {
    return bindActionCreators(actions, dispatch);
};

@Form.create()
@connect(mapStateToProps, mapDispatchToProps)
export default class Editor extends Component {
    componentDidMount () {
        const {articleId} = this.props.router.location.query;
        if (articleId) {
            this.props.getArticle({params: articleId});
        }
    }
    handleSubmit = (e) => {
        const {articleId} = this.props.router.location.query;
        e.preventDefault();
        this.props.form.validateFields(async (err, values) => {
            const {content, isFetching} = this.props.editor;
            if (err) return;
            if (isFetching) return;
            if (!content) {
                return notification.warning({
                    message: '请输入文章内容'
                });
            }
            const {type} = await this.props.editArticle({
                body: values,
                params: articleId
            });
            if (type === 'ADMIN_EDITARTICLE_SUCCESS') {
                hashHistory.replace('/admin/articles');
            }
        });
    }
    handleEditorChange = (content) => {
        this.props.updateModel(content);
    }
    render () {
        const {content, isFetching, title, category} = this.props.editor;
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14}
        };
        const tailFormItemLayout = {
            wrapperCol: {
                span: 14,
                offset: 6
            }
        };
        return (
            <Page className={style.container}>
                <Spin spinning={isFetching}>
                    <Form onSubmit={this.handleSubmit}>
                        <FormItem
                            {...formItemLayout}
                            label='标题'
                            hasFeedback
                        >
                            {getFieldDecorator('title', {
                                rules: [{
                                    required: true, message: '请输入标题'
                                }],
                                initialValue: title || ''
                            })(
                                <Input />
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label='文章分类'
                        >
                            {getFieldDecorator('category', {
                                initialValue: category || 'other'
                            })(
                                <Select>
                                    <Option value='other'>其他</Option>
                                </Select>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label='内容'
                            hasFeedback
                        >
                            <FroalaEditor
                                tag='textarea'
                                charCounterCount={false}
                                model={content}
                                onModelChange={this.handleEditorChange}
                            />
                        </FormItem>
                        <FormItem {...tailFormItemLayout}>
                            <Button type='primary' htmlType='submit' size='large'>提交</Button>
                            <Button className={style.goback} type='primary'><Link to='/admin/articles'>返回</Link></Button>
                        </FormItem>
                        <div className={style.disappear} ref='model' />
                    </Form>
                </Spin>
            </Page>
        );
    }
}
