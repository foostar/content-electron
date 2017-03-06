import React, {Component} from 'react';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {hashHistory} from 'react-router';
import {Form, Button, Input, Select, notification, Upload, Icon, message, Layout, Spin, Tag} from 'antd';
import * as actions from 'reducers/editor';

import Page from 'components/Page';
import style from './style.styl';
import ImgEditor from 'components/ImgEditor';
import 'froala-editor/js/froala_editor.pkgd.min.js';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'font-awesome/css/font-awesome.css';
import FroalaEditor from 'react-froala-wysiwyg';
import PublishModal from 'components/PublishModal';
const FormItem = Form.Item;
const Option = Select.Option;
const OptGroup = Select.OptGroup;

const mapStateToProps = state => {
    return {
        editor: state.editor,
        passport: state.passport
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
        const foolbar = document.querySelector('.fr-toolbar');
        foolbar.appendChild(this.refs.upload);
        if (articleId) {
            return this.props.getArticle({params: articleId});
        }
        this.props.clearArticle();
    }
    fetchData = () => new Promise(async (resolve, reject) => {
        const {articleId} = this.props.router.location.query;
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
            if (articleId) {
                const {type} = await this.props.editArticle({
                    body: data,
                    params: articleId
                });
                if (type === 'EDITARTICLE_SUCCESS') {
                    return resolve(true);
                }
            }
            const {type} = await this.props.addArticle({
                body: data
            });
            if (type === 'ADDARTICLE_SUCCESS') {
                return resolve(true);
            }
        });
    })
    handleSubmit = async (e) => {
        e.preventDefault();
        const result = await this.fetchData();
        if (result) {
            this.addSuccess();
        }
    }
    addSuccess = () => {
        hashHistory.replace('/articles');
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
        const blob = await this.getImg(item.url);
        const url = await this.uploadImg(blob);
        return {
            index: item.index,
            url
        };
    }
    async uploadImg (file) {
        const {token, key} = await this.getToken();
        const blob = file;
        const formData = new FormData();
        formData.append('key', key);
        formData.append('token', token);
        formData.append('file', blob);
        return fetch('http://upload.qiniu.com/', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(json => `http://ofsyr49wg.bkt.clouddn.com/${json.key}`);
    }
    getImg (url) {
        return fetch(url)
        .then(response => response.blob())
        .then(blob => blob);
    }
    editorConfig = {
        placeholderText: '写点什么吧!',
        dragInline: false,
        tooltips: false,
        imagePasteProcess: false,
        imageRoundPercent: false,
        toolbarSticky: false,
        quickInsertButtons: [ 'table', 'ul', 'ol', 'hr' ],
        toolbarButtonsSM: ['fullscreen', 'bold', 'italic', 'underline', 'fontFamily', 'fontSize', 'insertLink', 'insertTable', 'undo', 'redo'],
        toolbarButtons: ['print', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', '|', 'specialCharacters', 'color', 'emoticons', 'inlineStyle', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertHR', '-', 'insertLink', 'insertVideo', 'insertFile', 'insertTable', 'undo', 'redo', 'clearFormatting', 'selectAll', 'html'],
        toolbarButtonsMD: ['bold', 'italic', 'underline', 'fontFamily', 'fontSize', 'color', 'paragraphStyle', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertHR', 'insertLink', 'insertVideo', 'insertFile', 'insertTable', 'undo', 'redo', 'clearFormatting'],
        events: {
            'froalaEditor.initialized': (e, editor) => {
                editor.tooltip.hide();
                if (!this.$editor) {
                    this.$editor = editor;
                }
                this.bindImgEditor();
            },
            'froalaEditor.image.beforePasteUpload': (e, editor, img) => {
                return false;
            },
            'froalaEditor.image.beforeUpload': (e, editor, img) => {
                this.props.fetching();
                this.dropUpload(img);
                return false;
            }
        }
    }
    bindImgEditor () {
        $('.fr-element').on('mouseover', 'img', (e) => {
            const Img = $(e.target);
            const parent = Img.parent();
            parent.css({position: 'relative'}).append('<i style="margin-left:3px" class="editor fa fa-pencil-square-o fa-2x" aria-hidden="true"></i>');
            $('.editor').unbind('click');
            $('.editor').on('click', () => {
                $('.editor').unbind('click');
                $('.editor').remove();
                this.props.handleImg(Img.attr('src'));
            });
        });
        $('.fr-element').on('mouseout', 'img', (e) => {
            setTimeout(() => {
                $('.editor').remove();
            }, 500);
        });
    }
    async dropUpload (imgs) {
        this.$editor.popups.hideAll();
        this.$editor.html.cleanEmptyTags();
        document.querySelector('.fr-drag-helper').remove();
        const blob = imgs[0];
        const url = await this.uploadImg(blob);
        this.$editor.html.insert(`<img src='${url}'/>`, true);
    }
    getToken () {
        const url = `http://baijia.rss.apps.xiaoyun.com/api/qiniu/uptoken`;
        return fetch(url)
        .then(response => response.json())
        .then(json => json);
    }
    handleEditorChange = (content) => {
        const modelDom = $(this.refs.model);
        modelDom.html(content);
        const imgs = modelDom.find('img');
        if (imgs.parent().attr('data-wrap')) {
            return this.props.updateModel(content);
        }
        imgs.wrap('<div data-wrap="true"></div>');
        const newContent = modelDom.html();
        this.props.updateModel(newContent);
    }
    imageProcess = async (src, blob) => {
        this.props.fetching();
        const url = await this.uploadImg(blob);
        const html = this.$editor.html.get().replace(src, url);
        this.handleEditorChange(html);
        this.props.modalCancel();
        this.props.fetching(false);
    }
    handleImg = () => {
        this.props.handleImg();
    }
    render () {
        const {content, title, category, isFetching, modalVisible, isAlter, originSrc} = this.props.editor;
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
            <Page className={style.container}>
                <Spin spinning={isFetching}>
                    <Layout className={style.layout}>
                        <Form onSubmit={this.handleSubmit} className={style.editor}>
                            <Layout.Content className={style.content}>
                                <FormItem
                                    // {...formItemLayout}
                                    hasFeedback
                                >
                                    {getFieldDecorator('title', {
                                        rules: [{
                                            required: true, message: '请输入标题'
                                        }],
                                        initialValue: title || ''
                                    })(
                                        <Input placeholder='输入文章标题' />
                                    )}
                                    <Tag className={style['text-num']} color='blue'>
                                        已输入 {(getFieldValue('title') || {}).length || '0'} 个字
                                    </Tag>
                                </FormItem>
                                <FormItem
                                >
                                    {getFieldDecorator('category', {
                                        initialValue: category || '搞笑'
                                    })(
                                        <Select>
                                            <OptGroup label='搞笑'>
                                                <Option value='搞笑'>搞笑</Option>
                                                <Option value='美图'>美图</Option>
                                                <Option value='科学'>科学</Option>
                                                <Option value='历史'>历史</Option>
                                            </OptGroup>
                                            <OptGroup label='科技互联网'>
                                                <Option value='互联网'>互联网</Option>
                                                <Option value='科技'>科技</Option>
                                            </OptGroup>
                                            <OptGroup label='两性健康'>
                                                <Option value='两性'>两性</Option>
                                                <Option value='情感'>情感</Option>
                                                <Option value='女人'>女人</Option>
                                                <Option value='健康'>健康</Option>
                                            </OptGroup>
                                            <OptGroup label='国际社会'>
                                                <Option value='社会'>社会</Option>
                                                <Option value='三农'>三农</Option>
                                                <Option value='军事'>军事</Option>
                                                <Option value='游戏'>游戏</Option>
                                                <Option value='娱乐'>娱乐</Option>
                                                <Option value='体育'>体育</Option>
                                            </OptGroup>
                                            <OptGroup label='生活服务'>
                                                <Option value='宠物'>宠物</Option>
                                                <Option value='家居'>家居</Option>
                                                <Option value='时尚'>时尚</Option>
                                                <Option value='育儿'>育儿</Option>
                                                <Option value='美食'>美食</Option>
                                                <Option value='旅游'>旅游</Option>
                                                <Option value='汽车'>汽车</Option>
                                                <Option value='生活'>生活</Option>
                                            </OptGroup>
                                        </Select>
                                    )}
                                </FormItem>
                                <FormItem />
                                <FormItem
                                    hasFeedback
                                >
                                    <FroalaEditor
                                        tag='textarea'
                                        model={content}
                                        config={this.editorConfig}
                                        onModelChange={this.handleEditorChange}
                                    />
                                </FormItem>
                                <div ref='upload' className={style.upload}>
                                    <Upload {...props}>
                                        <Button>
                                            <Icon type='picture' />上传
                                        </Button>
                                    </Upload>
                                </div>
                                { isAlter && <ImgEditor
                                    src={originSrc}
                                    isFetching={isFetching}
                                    modalCancel={this.props.modalCancel}
                                    modalVisible={modalVisible}
                                    imageProcess={this.imageProcess}
                                /> }
                                <div className={style.disappear} ref='model' />

                            </Layout.Content>
                            <Layout.Footer className={style.footer}>
                                <Button type='primary' htmlType='submit'>提交</Button>
                                {this.props.passport.data.level !== 1 && <PublishModal
                                    beforeShowModal={this.fetchData}
                                    content={this.props.editor}
                                    afterClose={this.addSuccess}
                                >
                                    <Button type='primary'>发布</Button>
                                </PublishModal>}
                            </Layout.Footer>
                            <Button className='editbutton' style={{display: 'none'}}>
                                <Icon type='edit' /> 编辑
                            </Button>
                        </Form>
                    </Layout>
                </Spin>
            </Page>
        );
    }
}
