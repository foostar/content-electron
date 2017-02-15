import React, {Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// import { browserHistory } from 'react-router';
import { Form, Button, Spin } from 'antd';
import * as actions from 'reducers/editor';

import Page from 'components/Page';

import 'froala-editor/js/froala_editor.pkgd.min.js';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'font-awesome/css/font-awesome.css';

import FroalaEditor from 'react-froala-wysiwyg';

const FormItem = Form.Item;

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
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            const { model, isFetching } = this.props.editor;
            if (err) return;
            if (isFetching) return;
            this.props.fetching();
            this.replaceImg(model)
            .then((model) => {
                const data = Object.assign({}, values, {
                    model
                });
                console.log('data', data);
                // return this.props.editArticle(data)
                //     .then(() => {
                //         // browserHistory.replace('/article')
                //     });
            });
        });
    }
    replaceImg (model) {
        const modelDom = this.refs.model;
        modelDom.innerHTML = model;
        const aImgs = modelDom.getElementsByTagName('img');
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
        const { token, key } = await this.getToken();
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
            const { key } = json;
            return {
                index: item.index,
                url: `http://ofsyr49wg.bkt.clouddn.com/${key}`
            };
        });
    }
    getImg (url) {
        return fetch(url)
        .then(response => response.blob())
        .then((blob) => {
            return blob;
        });
    }
    getToken () {
        const url = `http://baijia.rss.apps.xiaoyun.com/api/qiniu/uptoken`;
        return fetch(url).then((response) => {
            return response.json();
        }).then((json) => {
            return json;
        });
    }
    handleEditorChange = (model) => {
        this.props.updateModel(model);
    }
    render () {
        const { model, isFetching } = this.props.editor;
        // const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 }
        };
        const tailFormItemLayout = {
            wrapperCol: {
                span: 14,
                offset: 6
            }
        };
        return (
            <Page>
                <Spin spinning={isFetching}>
                    <Form onSubmit={this.handleSubmit}>
                        { /* <FormItem
                            {...formItemLayout}
                            label='E-mail'
                            hasFeedback
                        >
                            {getFieldDecorator('email', {
                                rules: [{
                                    required: true, message: 'Please input your E-mail!'
                                }]
                            })(
                                <Input />
                            )}
                        </FormItem> */}
                        <FormItem
                            {...formItemLayout}
                            label='内容'
                            hasFeedback
                        >
                            <FroalaEditor
                                tag='textarea'
                                placeholderText='Edit Your Content Here!'
                                charCounterCount={false}
                                model={model}
                                onModelChange={this.handleEditorChange}
                            />
                        </FormItem>
                        <FormItem {...tailFormItemLayout}>
                            <Button type='primary' htmlType='submit' size='large'>提交</Button>
                        </FormItem>
                        <div ref='model' />
                    </Form>
                </Spin>
            </Page>
        );
    }
}


