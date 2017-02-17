import React, {Component} from 'react';
import {Table} from 'antd';
import style from './style.styl';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import Page from 'components/Page';
import * as actions from 'reducers/articles';
// import TableAction from '../../components/TableActions';

// const tableData = [ {
//     type: 'delete',
//     name: '删除'
// } ];
// const confirm = Modal.confirm;
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
        const { isFetching } = this.props.articles;
        if (isFetching) return;
        // const fromData = this.props.form.getFieldsValue()
        // const data = this.getFormData(fromData, page)
        this.props.getArticles({ query: { page } });
    }
    pageChange = (page) => {
        this.fetchData(page);
    }
    tableActionhandler = (type) => {
        const { selectKeys } = this.props.articles;
        if (type == 'delete') {
            console.log('selectKeys', selectKeys);
            // return this.deleteConfirm(selectKeys);
        }
    }
    // delete (ids) {
    //     const { page } = this.props.articles;
    //     this.props.deleteComment({ commentsId: JSON.stringify(ids) })
    //     .then(() => {
    //         if (this.props.articles.content.length == 0) {
    //             if (page > 1) {
    //                 this.fetchData(page - 1);
    //             }
    //         }
    //     });
    // }
    // deleteConfirm (ids) {
    //     const { isFetching } = this.props.commentlist;
    //     const self = this;
    //     if (isFetching) return;
    //     confirm({
    //         title: '你确定要删除这个评论吗?',
    //         onOk () {
    //             self.delete(ids);
    //         },
    //         onCancel () {}
    //     });
    // }
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
        title: '操作',
        key: 'action',
        render: (text, record) => (
            <span>
                <Link to={`/editor?articleId=${record.id}`}>编辑</Link>
                { /* <span className='ant-divider' />
                <a>删除</a> */ }
            </span>
      )
    }]
    rowSelection = {
        onSelect: (record, selected, selectedRows) => {
            const rowsKey = selectedRows.map((v) => {
                return v.key;
            });
            this.props.changeSelectRows(rowsKey);
        },
        onSelectAll: (selected, selectedRows) => {
            const rowsKey = selectedRows.map((v) => {
                return v.key;
            });
            this.props.changeSelectRows(rowsKey);
        }
    }
    render () {
        const { contents, count, isFetching } = this.props.articles;
        return (
            <Page className={style.container}>
                <Table
                    rowSelection={this.rowSelection}
                    columns={this.columns}
                    dataSource={contents}
                    pagination={{ total: count, onChange: this.pageChange, pageSize: 10 }}
                    loading={isFetching}
                />
                { /* <TableAction data={tableData} action={this.tableActionhandler} /> */ }
            </Page>
        );
    }
}
