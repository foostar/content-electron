import React, {Component} from 'react';
import Simditor from 'components/Simditor';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as contentActions from 'reducers/contents';
import * as managerActions from 'reducers/manager';
import {Tag, Button, Layout, Form, Input, message} from 'antd';
import style from './style.styl';
import CategorySelect from 'components/CategorySelect';
import {hashHistory} from 'react-router';

const mapStateToProps = state => {
    return {
        level: state.passport.data.level
    };
};
const mapDispatchToProps = dispatch => {
    return {
        contentActions: bindActionCreators(contentActions, dispatch),
        managerActions: bindActionCreators(managerActions, dispatch)
    };
};
const {Content, Footer} = Layout;
const FormItem = Form.Item;

// route: HOST/editor/:contentId

// 新增文章 contentId = new
// 查看老文章 contentId = mongoId

// 普通用户 保存
// 小编用户 保存/发布

@Form.create()
@connect(mapStateToProps, mapDispatchToProps)
class Editor extends Component {
    state = {data: {}}
    async componentDidMount () {
        const {contentId} = this.props.params;
        if (contentId === 'new') return this.setState({data: {}});
        const {payload} = await this.props.contentActions.getContent({params: contentId});
        this.setState({data: payload.result.data});
    }
    onPublish = async () => {
        let {contentId} = this.props.params;
        if (contentId === 'new') {
            contentId = await this.onCreate();
        }
        const res = await this.props.contentActions.getContent({params: contentId});
        this.props.managerActions.publish(res.payload.result.data);
    }
    onCreate = () => new Promise((resolve, reject) => {
        this.props.form.validateFields(async (err, values) => {
            if (err) return;
            const {title, category} = values;
            const content = this.editor.getValue();
            const {type, payload} = await this.props.contentActions.addContent({
                body: {title, category, content, type: 'article'}
            });

            if (type === 'ADD_CONTENT_SUCCESS') {
                message.success(`${title} 创建成功`);
                if (this.props.params.contentId === 'new') {
                    hashHistory.replace('/contents');
                }
                hashHistory.goBack();
                resolve(payload.result.data.id);
            }
        });
    })
    onUpdate = () => this.props.form.validateFields(async (err, values) => {
        if (err) return;
        const {title, category} = values;
        const content = this.editor.getValue();
        const {type} = await this.props.contentActions.updateContent({
            body: {title, category, content},
            params: this.props.params.contentId
        });

        if (type === 'UPDATE_CONTENT_SUCCESS') {
            message.success(`${title} 更新成功`);
            // hashHistory.replace('/contents');
            hashHistory.goBack();
        }
    });
    render () {
        const {getFieldDecorator, getFieldValue} = this.props.form;
        const {title, category} = this.state.data;
        const {contentId} = this.props.params;
        return (
            <Form className={style.form} onSubmit={this.onSubmit}>
                <Layout className={style.layout}>
                    <Layout>
                        <Content style={{overflow: 'auto', padding: '20px 10px 0 20px'}}>
                            <FormItem>
                                {getFieldDecorator('title', {
                                    rules: [{required: true, message: '请输入标题'}],
                                    initialValue: title || ''
                                })(<Input placeholder='输入文章标题' autoFocus />)}
                                <Tag className={style['text-num']} color='blue'>
                                    <span>已输入 {(getFieldValue('title') || {}).length || '0'} 个字</span>
                                </Tag>
                            </FormItem>
                            <FormItem>
                                {getFieldDecorator('category', {
                                    rules: [{required: true, message: '请输入选择分类'}],
                                    initialValue: category || []
                                })(<CategorySelect />)}
                            </FormItem>
                            <Simditor
                                placeholder='看到我就说明你什么都没写呢...'
                                height='calc(100vh - 320px)'
                                getEditor={editor => { this.editor = editor; }}
                            >
                                {this.state.data.content}
                            </Simditor>
                        </Content>
                        {/* <Sider width='320' className={style.sider} style={{paddingLeft: 12}}>
                            img sider
                        </Sider> */}
                    </Layout>
                    <Footer className={style.footer}>
                        {contentId === 'new'
                            ? <Button type='primary' size='large' onClick={this.onCreate}>新增</Button>
                            : <Button type='primary' size='large' onClick={this.onUpdate}>更新</Button>
                        }
                        {this.props.level !== 1 &&
                            <Button type='primary' size='large' onClick={this.onPublish}>发布</Button>
                        }
                        {contentId !== 'new' && this.props.level !== 1 &&
                            <Button type='primary' size='large' onClick={this.onCreate}>另存为</Button>
                        }
                    </Footer>
                </Layout>
            </Form>
        );
    }
}

export default Editor;
