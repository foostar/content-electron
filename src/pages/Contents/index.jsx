import React, {Component} from 'react';
import {Table, Layout, Button} from 'antd';
import moment from 'moment';
import style from './style.styl';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {bindActionCreators} from 'redux';
import Page from 'components/Page';
import * as actions from 'reducers/contents';

const {Column} = Table;

const mapStateToProps = state => {
    return {
        articles: state.articles
    };
};
const mapDispatchToProps = dispatch => {
    return bindActionCreators(actions, dispatch);
};
@connect(mapStateToProps, mapDispatchToProps)
class Contents extends Component {
    componentDidMount () {
        this.fetchData();
    }
    fetchData (page) {
        page = (page - 1) || 0;
        const {isFetching} = this.props.articles;
        if (isFetching) return;
        this.props.getContents({query: {
            limit: 10,
            skip: page * 10
        }});
    }
    pageChange = (page) => {
        this.props.pageChange(page);
        this.fetchData(page);
    }
    render () {
        const {contents, count, isFetching} = this.props.articles;
        const pagination = {total: count, onChange: this.pageChange, pageSize: 10};
        return (
            <Page className={style.container}>
                <Layout className={style.layout}>
                    <Layout.Header className={style.header}>
                        <Link to='/editor/new'>
                            <Button icon='plus'>发表新文章</Button>
                        </Link>
                    </Layout.Header>
                    <Layout.Content className={style.content}>
                        <Table
                            bordered
                            rowSelection={this.rowSelection}
                            columns={this.columns}
                            dataSource={contents}
                            pagination={pagination}
                            loading={isFetching}
                        >
                            <Column
                                title='标题'
                                dataIndex='title'
                                key='title'
                                render={(title, content) =>
                                    <Link style={{color: '#333', fontWeight: 500}} to={`/editor/${content.id}`}>
                                        {title}
                                    </Link>
                                }
                            />
                            <Column
                                title='分类'
                                dataIndex='category'
                                key='category'
                            />
                            <Column
                                title='创建时间'
                                dataIndex='createdAt'
                                key='createdAt'
                                render={(time) => moment(time).format('YYYY-MM-DD hh:mm')}
                            />
                        </Table>
                    </Layout.Content>
                </Layout>
            </Page>
        );
    }
}

export default Contents;
