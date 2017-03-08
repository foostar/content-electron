import React, {Component} from 'react';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {hashHistory, Link} from 'react-router';
import {Layout, Form, Button, Input, Tag, notification, Upload, Icon, message} from 'antd';
import CategorySelect from 'components/CategorySelect';
import * as actions from 'reducers/admin/editor';

import Page from 'components/Page';
import style from './style.styl';

import 'froala-editor/js/froala_editor.pkgd.min.js';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'font-awesome/css/font-awesome.css';

import FroalaEditor from 'react-froala-wysiwyg';

const FormItem = Form.Item;
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
            const foolbar = document.querySelector('.fr-dropdown-menu');
            foolbar.appendChild(this.refs.upload);
            this.refs.upload.parentNode.style.width = '85px';
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
            this.props.fetching();
            const _content = await this.replaceImg(content);

            const data = Object.assign({}, values, {
                type: 'article',
                content: _content
            });
            const {type} = await this.props.editArticle({
                body: data,
                params: articleId
            });
            if (type === 'ADMIN_EDITARTICLE_SUCCESS') {
                hashHistory.replace('/admin/articles');
            }
        });
    }
    replaceImg (content) {
        const modelDom = this.refs.model;
        modelDom.innerHTML = content;
        const aImgs = modelDom.getElementsByTagName('img');
        let oImg = null;
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
                oImg = aImgs[i];
                if (!/ofsyr49wg/.test(oImg.getAttribute('src'))) {
                    oImg.setAttribute('src', newUrls[i].url);
                }
                if (oImg.getAttribute('data-fr-image-pasted')) {
                    oImg.removeAttribute('data-fr-image-pasted');
                }
            }
            return modelDom.innerHTML;
        });
    }
    async fetchImg (item) {
        if (/ofsyr49wg/.test(item.url)) {
            return item;
        }
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
    editorConfig = {
        placeholderText: '写点什么吧!',
        toolbarButtons: ['fullscreen', 'print', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', '|', 'specialCharacters', 'color', 'emoticons', 'inlineStyle', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertHR', '-', 'insertLink', 'insertVideo', 'insertFile', 'insertTable', 'undo', 'redo', 'clearFormatting', 'selectAll', 'html'],
        toolbarButtonsMD: ['fullscreen', 'bold', 'italic', 'underline', 'fontFamily', 'fontSize', 'color', 'paragraphStyle', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertHR', 'insertLink', 'insertVideo', 'insertFile', 'insertTable', 'undo', 'redo', 'clearFormatting'],
        events: {
            'froalaEditor.initialized': (e, editor) => {
                if (!this.$editor) {
                    this.$editor = editor;
                }
            },
            'froalaEditor.image.beforePasteUpload': (e, editor) => {
                return false;
            },
            'froalaEditor.image.beforeUpload': (e, editor) => {
                editor.tooltip.hide();
                return false;
            }
        }
    }
    render () {
        const {content, title, category} = this.props.editor;
        const {getFieldDecorator, getFieldValue} = this.props.form;
        const self = this;
        const props = {
            name: 'file',
            action: 'http://upload.qiniu.com/',
            accept: 'image/png, image/jpeg, image/gif',
            data: {},
            imageInfo: {},
            showUploadList: false,
            beforeUpload (file) {
                const url = `http://baijia.rss.apps.xiaoyun.com/api/qiniu/uptoken`;
                return fetch(url)
                .then(response => response.json())
                .then(json => {
                    props.data = Object.assign(props.data, json);
                });
            },
            onChange (info) {
                if (info.file.status === 'uploading') {
                    self.props.fetching();
                }
                if (info.file.status === 'done') {
                    self.props.fetching(false);
                    self.$editor.html.insert(`<img src='http://ofsyr49wg.bkt.clouddn.com/${info.file.response.key}'/>`, true);
                } else if (info.file.status === 'error') {
                    message.error('图片上传失败，请重试！');
                }
            }
        };
        return (
            <Page>
                <Form onSubmit={this.handleSubmit} style={{height: '100%'}}>
                    <Layout className={style.layout}>
                        <Layout.Content className={style.content}>
                            <div className={style.inner}>
                                <FormItem>
                                    {getFieldDecorator('title', {
                                        rules: [{
                                            required: true, message: '请输入标题'
                                        }],
                                        initialValue: title || ''
                                    })(<Input placeholder='输入文章标题' autoFocus />)}
                                    <Tag className={style['text-num']} color='blue'>
                                        已输入 {(getFieldValue('title') || {}).length || '0'} 个字
                                    </Tag>
                                </FormItem>
                                <FormItem>
                                    {getFieldDecorator('category', {
                                        initialValue: category || []
                                    })(<CategorySelect />)}
                                </FormItem>
                                <FormItem hasFeedback>
                                    <FroalaEditor
                                        tag='textarea'
                                        config={this.editorConfig}
                                        charCounterCount={false}
                                        model={content}
                                        onModelChange={this.handleEditorChange}
                                    />
                                </FormItem>
                            </div>
                        </Layout.Content >
                        <Layout.Footer className={style.footer}>
                            <Button type='primary' htmlType='submit' size='large'>保存</Button>
                            <Button className={style.goback} type='primary' size='large'>
                                <Link to='/admin/articles'>返回</Link>
                            </Button>
                        </Layout.Footer>
                        <div ref='upload' className={style.upload}>
                            <Upload {...props}>
                                <Button>
                                    <Icon type='picture' />上传
                                </Button>
                            </Upload>
                        </div>
                        <div className={style.disappear} ref='model' />
                    </Layout>
                </Form>
            </Page>
        );
    }
}
