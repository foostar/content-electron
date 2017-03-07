import React, {Component} from 'react';
import {Table, Layout, Button} from 'antd';
import moment from 'moment';
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
            skip: page * 10
        }});
    }
    pageChange = (page) => {
        this.props.pageChange(page);
        this.fetchData(page);
    }
    columns = [{
        title: '标题',
        dataIndex: 'title',
        key: 'title',
        render: (title, record) => <Link style={{color: '#333', fontWeight: 500}} to={`/editor?articleId=${record.id}`}>{title}</Link>
    }, {
        title: '分类',
        dataIndex: 'category',
        key: 'category'
    }, {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (time) => moment(time).format('YY-M-D h:m')
    }, {
        title: '操作',
        key: 'action',
        render: (text, record) => <Button disabled shape='circle' size='small' icon='delete' />
    }]
    render () {
        const {contents, count, isFetching} = this.props.articles;
        return (
            <Page className={style.container}>
                <Layout className={style.layout}>
                    <Layout.Header className={style.header}>
                        <Link to='/editor'>
                            <Button
                                icon='plus'
                                onClick={() => this.setState({visible: true})}
                            >
                                发表新文章
                            </Button>
                        </Link>
                    </Layout.Header>
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
