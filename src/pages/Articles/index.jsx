import React, {Component} from 'react';
import {Table, Form, Input, Button, Select} from 'antd';
import style from './style.styl';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {bindActionCreators} from 'redux';
import Page from 'components/Page';
import * as actions from 'reducers/articles';

const FormItem = Form.Item;
const Option = Select.Option;
const mapStateToProps = state => {
    return {
        articles: state.articles
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
    }
    fetchData (page) {
        page = (page - 1) || 0;
        const {isFetching} = this.props.articles;
        if (isFetching) return;
        const fromData = this.props.form.getFieldsValue();
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
                data[v] = fromData[v];
            };
        });
        return data;
    }
    pageChange = (page) => {
        this.props.pageChange(page);
        this.fetchData(page);
    }
    columns = [{
        title: '文章id',
        dataIndex: 'id',
        key: 'id'
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
        title: '操作',
        key: 'action',
        render: (text, record) => (
            <span>
                <Link to={`/editor?articleId=${record.id}`}>编辑</Link>
            </span>
      )
    }]
    render () {
        const {getFieldDecorator} = this.props.form;
        const {contents, count, isFetching} = this.props.articles;
        return (
            <Page className={style.container}>
                <div className={style.tableform}>
                    <Form inline onSubmit={this.handleSubmit}>
                        <FormItem>
                            <Button type='primary'><Link to='/editor'>新建文章</Link></Button>
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('title', {
                                rules: []
                            })(
                                <Input placeholder='文章标题' />
                      )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('category', {
                                rules: [],
                                initialValue: ''
                            })(
                                <Select>
                                    <Option value=''>全部</Option>
                                    <Option value='other'>其他</Option>
                                </Select>
                            )}
                        </FormItem>
                        <FormItem className={style.tablesubmit}>
                            <Button type='primary' htmlType='submit'>搜索</Button>
                        </FormItem>
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
