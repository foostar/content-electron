import React, {Component} from 'react';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {hashHistory, Link} from 'react-router';
import {Form, Button, Spin, Input, Select, notification} from 'antd';
import * as actions from 'reducers/editor';

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
        editor: state.editor
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
            return this.props.getArticle({params: articleId});
        }
        this.props.clearArticle();
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
            if (articleId) {
                const {type} = await this.props.editArticle({
                    body: values,
                    params: articleId
                });
                if (type === 'EDITARTICLE_SUCCESS') {
                    hashHistory.replace('/articles');
                }
                return;
            }
            this.props.fetching();
            const _content = await this.replaceImg(content);

            const data = Object.assign({}, values, {
                type: 'article',
                content: _content
            });

            const {type} = await this.props.addArticle({
                body: data
            });
            if (type === 'ADDARTICLE_SUCCESS') {
                hashHistory.replace('/articles');
            }
        });
    }
    replaceImg (content) {
        const modelDom = this.refs.model;
        modelDom.innerHTML = content;
        const aImgs = modelDom.getElementsByTagName('img');
        if (aImgs.length < 1) return new Promise((resolve, reject) => resolve(content));
        const beforeImgs = [];
        for (let i = 0; i < aImgs.length; i++) {
            let src = aImgs[i].getAttribute('src');
            beforeImgs.push({
                index: i,
                url: src
            });
        }
        return Promise.all(beforeImgs.map((v) => {
            return this.fetchImg(v);
        }))
        .then(newUrls => {
            newUrls = newUrls.sort((a, b) => {
                return a.index - b.index;
            });
            for (let i = 0; i < aImgs.length; i++) {
                aImgs[i].setAttribute('src', newUrls[i].url);
            }
            return modelDom.innerHTML;
        });
    }
    async fetchImg (item) {
        const {token, key} = await this.getToken();
        const blob = await this.getImg(item.url);
        const formData = new FormData();
        formData.append('key', key);
        formData.append('token', token);
        formData.append('file', blob);
        return fetch('http://upload.qiniu.com/', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(json => {
            const {key} = json;
            return {
                index: item.index,
                url: `http://ofsyr49wg.bkt.clouddn.com/${key}`
            };
        });
    }
    getImg (url) {
        return fetch(url)
        .then(response => response.blob())
        .then(blob => blob);
    }
    getToken () {
        const url = `http://baijia.rss.apps.xiaoyun.com/api/qiniu/uptoken`;
        return fetch(url)
        .then(response => response.json())
        .then(json => json);
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
                            <Button className={style.goback} type='primary'><Link to='/articles'>返回</Link></Button>
                        </FormItem>
                        <div className={style.disappear} ref='model' />
                    </Form>
                </Spin>
            </Page>
        );
    }
}
