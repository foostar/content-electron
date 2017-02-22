import React, {Component} from 'react';
import {Table, Form, Button, Select, Tag, Row, Col, Icon} from 'antd';
import style from './style.styl';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {bindActionCreators} from 'redux';
import Page from 'components/Page';
import FormSearch from './FormSearch';
import PublishModal from './PublishModal';
import * as actions from 'reducers/admin/articles';

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
        const {isFetching} = this.props.articles;
        if (isFetching) return;
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
    addTag = (tag) => {
        this.props.addTag({
            params: {
                id: tag.id,
                tag: tag.value[0]
            }
        });
    }
    renderTag = (_, record) => {
        const tags = record.tags.map((v, index) => {
            return <Tag className={style.table_tag} key={index} closable afterClose={() => this.removeTag({id: record.id, value: v})}>{v}</Tag>;
        });
        const {recentTag} = this.props.articles;
        const children = recentTag.map((v, index) => {
            return <Option key={index} value={v}>{v}</Option>;
        });
        return (
            <div>
                {tags}
                {!record.inputVisible && <Button size='small' type='dashed' onClick={() => this.showNewTag(record.id)}>+ 新标签</Button>}
                {record.inputVisible && (
                    <Select tags
                        style={{width: '100%'}}
                        searchPlaceholder='标签模式'
                        onChange={(value) => this.addTag({id: record.id, value})}
                        value={record.inputValue}
                    >
                        {children}
                    </Select>
                )}
            </div>
        );
    }
    removeTag (data) {
        this.props.removeTag({
            params: {
                id: data.id,
                tag: data.value
            }
        });
    }
    handleReset = () => {
        this.props.form.resetFields();
        this.props.changeForm({});
    }
    showNewTag (id) {
        this.props.showNewTag({isShow: true, id});
    }
    columns = [{
        title: '文章id',
        dataIndex: 'id',
        key: 'id'
    }, {
        title: '作者',
        dataIndex: 'author',
        key: 'author',
        render: author => author.username
    }, {
        title: '文章标题',
        dataIndex: 'title',
        key: 'title'
    }, {
        title: '文章分类',
        dataIndex: 'category',
        key: 'category'
    }, {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt'
    }, {
        title: '文章标签',
        dataIndex: 'tag',
        key: 'tag',
        width: 300,
        render: this.renderTag
    }, {
        title: '操作',
        key: 'action',
        width: 90,
        render: (text, record) => (
            <span>
                <Link to={`/admin/editor?articleId=${record.id}`}>编辑</Link>
                &emsp;<PublishModal content={record} />
            </span>
      )
    }]
    render () {
        const {getFieldDecorator} = this.props.form;
        const {contents, count, isFetching, form, expand, recentTag} = this.props.articles;
        return (
            <Page className={style.container}>
                <div className={style.tableform}>
                    <Form onSubmit={this.handleSubmit} className={style['ant-advanced-search-form']}>
                        <FormSearch form={form} getFieldDecorator={getFieldDecorator} recentTag={recentTag} expand={expand} />
                        <Row>
                            <Col span={24} style={{textAlign: 'right'}}>
                                <Button type='primary' htmlType='submit'>搜索</Button>
                                <Button style={{marginLeft: 8}} onClick={this.handleReset}>
                                    清空
                                </Button>
                                <a style={{marginLeft: 8, fontSize: 12}} onClick={this.props.toggle}>
                                    {expand ? '合上' : '展开'} <Icon type={expand ? 'up' : 'down'} />
                                </a>
                            </Col>
                        </Row>
                    </Form>
                </div>
                <Table
                    rowSelection={this.rowSelection}
                    columns={this.columns}
                    dataSource={contents}
                    pagination={{total: count, onChange: this.pageChange, pageSize: 10}}
                    loading={isFetching}
                />
            </Page>
        );
    }
}
