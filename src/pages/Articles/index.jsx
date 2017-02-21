import React, {Component} from 'react';
import {Table} from 'antd';
import style from './style.styl';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {bindActionCreators} from 'redux';
import Page from 'components/Page';
import * as actions from 'reducers/articles';

const mapStateToProps = state => {
    return {
        articles: state.articles
    };
};
const mapDispatchToProps = dispatch => {
    return bindActionCreators(actions, dispatch);
};
@connect(mapStateToProps, mapDispatchToProps)
export default class extends Component {
    componentDidMount () {
        this.fetchData();
    }
    fetchData (page) {
        page = (page - 1) || 0;
        const {isFetching} = this.props.articles;
        if (isFetching) return;
        this.props.getArticles({query: {
            limit: 10,
            skip: page
        }});
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
        const {contents, count, isFetching} = this.props.articles;
        return (
            <Page className={style.container}>
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
