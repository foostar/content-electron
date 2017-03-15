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
        contents: state.contents
    };
};
const mapDispatchToProps = dispatch => {
    return bindActionCreators(actions, dispatch);
};
@connect(mapStateToProps, mapDispatchToProps)
class Contents extends Component {
    componentDidMount () {
        const page = (this.props.contents.skip / 10) + 1;
        this.fetchData(page);
    }
    fetchData = (page = 1) => {
        const {fetching} = this.props.contents;
        if (fetching) return;
        this.props.getContents({query: {
            limit: 10,
            skip: (page - 1) * 10
        }});
    }
    render () {
        const {data, skip, count, fetching} = this.props.contents;
        const pagination = {
            total: count,
            onChange: this.fetchData,
            current: ~~(skip / 10) + 1,
            pageSize: 10
        };
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
                            rowKey='id'
                            dataSource={data}
                            pagination={pagination}
                            loading={fetching}
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
