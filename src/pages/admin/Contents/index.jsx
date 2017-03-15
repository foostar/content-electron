import React, {Component} from 'react';
import {message, Table, Form, Button, Select, Tag, Layout} from 'antd';
import style from './style.styl';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {bindActionCreators} from 'redux';
import Page from 'components/Page';
import FormSearch from './FormSearch';
import PublishModal from 'components/PublishModal';
import * as actions from 'reducers/admin/contents';
import moment from 'moment';
import {findDOMNode} from 'react-dom';
import {omitBy} from 'lodash';

const {Column} = Table;
const {Option} = Select;
const mapStateToProps = state => {
    return {
        contents: state.adminContents
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
    fetchData = (page) => {
        let {skip} = this.props.contents;

        if (page) {
            skip = (page - 1) * 10;
        }

        let query = this.props.form.getFieldsValue();

        query.skip = skip;
        query.limit = 10;

        query = omitBy(query, item => {
            if (!item) return true;
            if (Array.isArray(item)) {
                if (item.length === 0) return true;
                if (!item[0]) return true;
            }
            return false;
        });
        this.props.getContents({query});
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.fetchData(1);
    }
    renderTag = (_, content) => {
        const {recentTag} = this.props.contents;
        const {addTag, removeTag} = this.props;
        return (
            <TagSelector
                fetchData={this.fetchData}
                key={content.id}
                recentTag={recentTag}
                content={content}
                removeTag={removeTag}
                addTag={addTag}
            />
        );
    }
    handleReset = () => {
        this.props.form.resetFields();
        this.props.changeForm({});
    }
    render () {
        const {getFieldDecorator} = this.props.form;
        const {data, count, fetching, condition, recentTag} = this.props.contents;
        const pagination = {
            current: ~~(this.props.contents.skip / 10) + 1,
            total: count,
            onChange: this.fetchData,
            pageSize: 10
        };
        return (
            <Page className={style.container}>
                <Layout className={style.layout}>
                    <Layout.Sider width='200' className={style.sider}>
                        <h3>搜索条件</h3>
                        <Form onSubmit={this.handleSubmit}>
                            <FormSearch
                                condition={condition}
                                recentTag={recentTag}
                                searchUser={this.props.searchUser}
                                getFieldDecorator={getFieldDecorator}
                            />
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
                            rowKey='id'
                            dataSource={data}
                            pagination={pagination}
                            loading={fetching}
                        >
                            <Column
                                title='文章标题'
                                dataIndex='title'
                                width={300}
                                key='title'
                                render={(title, record) =>
                                    <Link style={{color: '#333', fontWeight: 500}} to={`/editor/${record.id}`}>
                                        {title}
                                    </Link>
                                }
                            />
                            <Column
                                title='作者'
                                dataIndex='author'
                                key='author'
                                width={100}
                                render={author => author ? author.username : '作者已被删除'}
                            />
                            <Column
                                title='文章分类'
                                dataIndex='category'
                                key='category'
                                width={80}
                            />
                            <Column
                                title='创建时间'
                                dataIndex='createdAt'
                                width={120}
                                key='createdAt'
                                render={(time) => moment(time).format('YYYY-MM-DD hh:mm')}
                            />
                            <Column
                                title='文章标签'
                                dataIndex='tags'
                                key='tags'
                                render={this.renderTag}
                            />
                            <Column
                                title='操作'
                                key='action'
                                width={90}
                                render={(text, record) =>
                                    <PublishModal content={record}>
                                        <a>发布</a>
                                    </PublishModal>
                                }
                            />
                        </Table>
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
                id: this.props.content.id,
                tag: v[0]
            }
        });
        this.setState({inputValue: []});
        message.success('添加成功');
        this.props.fetchData();
    }
    removeTag = (tag) => {
        const {id} = this.props.content;
        const params = {id, tag};
        this.props.removeTag({params});
        message.success('删除成功');
    }
    toggleVisible = () => {
        this.setState({
            inputVisible: !this.state.inputVisible
        }, () => {
            this.refs.select && findDOMNode(this.refs.select).click();
        });
    }

    render () {
        const {content: {tags}, recentTag} = this.props;
        return (
            <div>
                {tags.map(label =>
                    <Tag
                        closable
                        key={label}
                        className={style['table-tag']}
                        afterClose={() => this.removeTag(label)}
                    >
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
                        searchPlaceholder='选择标签'
                        onChange={this.addTag}
                        value={this.state.inputValue}
                    >
                        {recentTag.filter(item => !tags.includes(item)).map(value =>
                            <Option key={value} value={value}>{value}</Option>
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
                )}
            </div>
        );
    }
}
