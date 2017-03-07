import React, {Component} from 'react';
import {Table, Form, Button, Select, Tag, Layout} from 'antd';
import style from './style.styl';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {bindActionCreators} from 'redux';
import Page from 'components/Page';
import FormSearch from './FormSearch';
import PublishModal from './PublishModal';
import * as actions from 'reducers/admin/articles';
import moment from 'moment';
import {findDOMNode} from 'react-dom';

const Option = Select.Option;
const mapStateToProps = state => {
    return {
        articles: state.adminArticles
    };
};
const mapDispatchToProps = dispatch => {
    return bindActionCreators(actions, dispatch);
};
@Form.create()
@connect(mapStateToProps, mapDispatchToProps)
export default class extends Component {
    componentDidMount () {
        this.fetchData();
        this.props.getRecentTag();
    }
    fetchData (page) {
        page = (page - 1) || 0;
        const fromData = this.props.form.getFieldsValue();
        this.props.changeForm(fromData);
        const data = this.getFormData(fromData, page);
        this.props.getArticles({query: data});
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.fetchData();
    }
    getFormData (fromData, skip) {
        skip = skip || this.props.articles.skip;
        const data = {
            skip,
            limit: 10
        };
        Object.keys(fromData).forEach((v) => {
            if (fromData[v]) {
                if (fromData[v] instanceof Array) {
                    if (fromData[v].length > 0) {
                        data[v] = fromData[v];
                    }
                } else {
                    data[v] = fromData[v];
                }
            };
        });
        return data;
    }
    pageChange = (page) => {
        this.props.pageChange(page);
        this.fetchData(page);
    }
    renderTag = (_, record) => {
        const {recentTag} = this.props.articles;
        const {addTag, removeTag} = this.props;
        return (
            <TagSelector
                recentTag={recentTag}
                record={record}
                removeTag={removeTag}
                addTag={addTag}
            />
        );
    }

    handleReset = () => {
        this.props.form.resetFields();
        this.props.changeForm({});
    }

    columns = [{
        title: '文章标题',
        dataIndex: 'title',
        width: 300,
        key: 'title',
        render: (title, record) => <Link style={{color: '#333', fontWeight: 500}} to={`/admin/articles/editor?articleId=${record.id}`}>{title}</Link>
    }, {
        title: '作者',
        dataIndex: 'author',
        key: 'author',
        width: 100,
        render: author => author ? author.username : '作者已被删除'
    }, {
        title: '文章分类',
        dataIndex: 'category',
        key: 'category',
        width: 80
    }, {
        title: '创建时间',
        dataIndex: 'createdAt',
        width: 120,
        key: 'createdAt',
        render: (time) => moment(time).format('YY-M-D h:m')
    }, {
        title: '文章标签',
        key: 'tag',
        render: this.renderTag
    }, {
        title: '操作',
        key: 'action',
        width: 90,
        render: (text, record) => <PublishModal content={record} ><a>发布</a></PublishModal>
    }]
    render () {
        const {getFieldDecorator} = this.props.form;
        const {contents, count, isFetching, form, recentTag} = this.props.articles;
        return (
            <Page className={style.container}>
                <Layout className={style.layout}>
                    <Layout.Sider width='200' className={style.sider}>
                        <h3>搜索条件</h3>
                        <Form onSubmit={this.handleSubmit}>
                            <FormSearch form={form} getFieldDecorator={getFieldDecorator} recentTag={recentTag} />
                            <div className={style.buttons}>
                                <Button onClick={this.handleReset}>
                                    清空
                                </Button>
                                <Button type='primary' htmlType='submit'>搜索</Button>
                            </div>
                        </Form>
                    </Layout.Sider>
                    <Layout.Content className={style.content}>
                        <Table
                            bordered
                            rowSelection={this.rowSelection}
                            columns={this.columns}
                            dataSource={contents}
                            pagination={{total: count, onChange: this.pageChange, pageSize: 10}}
                            loading={isFetching}
                        />
                    </Layout.Content>
                </Layout>
            </Page>
        );
    }
}

class TagSelector extends Component {
    state = {
        inputVisible: false,
        inputValue: []
    }

    addTag = (v) => {
        if (!v) return;
        this.props.addTag({
            params: {
                id: this.props.record.id,
                tag: v[0]
            }
        });
        this.setState({inputValue: []});
    }
    removeTag = (tag) => {
        this.props.removeTag({
            params: {
                id: this.props.record.id,
                tag
            }
        });
    }

    toggleVisible = () => {
        this.setState({
            inputVisible: !this.state.inputVisible
        }, () => {
            this.refs.select && findDOMNode(this.refs.select).click();
        });
    }

    render () {
        const {record: {tags}, recentTag} = this.props;
        return (
            <div>
                {tags.map((label, index) =>
                    <Tag
                        closable
                        key={index}
                        className={style['table-tag']}
                        afterClose={() => this.removeTag(label)}>
                        {label}
                    </Tag>
                )}
                {this.state.inputVisible ? (
                    <Select
                        tags
                        size='small'
                        ref='select'
                        style={{width: '100%'}}
                        onBlur={this.toggleVisible}
                        searchPlaceholder='标签模式'
                        onChange={this.addTag}
                        value={this.state.inputValue}
                    >
                        {recentTag.map((v, index) =>
                            <Option key={index} value={v}>{v}</Option>
                        )}
                    </Select>
                ) : (
                    <Button
                        size='small'
                        type='dashed'
                        onClick={this.toggleVisible}
                    >
                        <span>+ 新标签</span>
                    </Button>
                )
                }
            </div>
        );
    }
}
