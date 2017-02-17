import React, {Component} from 'react';
import {Button, Table, Icon} from 'antd';
import style from './style.styl';
import Page from 'components/Page';

const columns = [{
    title: '账户名称',
    dataIndex: 'name',
    key: 'name',
    render: text => <a>{text}</a>
}, {
    title: '发文数量',
    dataIndex: 'articles',
    key: 'articles',
    sorter: (a, b) => a.articles - b.articles
}, {
    title: '所属平台',
    dataIndex: 'platfrom',
    key: 'platfrom',
    filters: [{
        text: '百家号',
        value: '百家号'
    }, {
        text: '企鹅号',
        value: '企鹅号'
    }],
    onFilter: (value, record) => record.platfrom.includes(value)
}, {
    title: (
        <Button type='primary' shape='circle' size='small'>
            <Icon type='plus' />
        </Button>
    ),
    key: 'action',
    render: (text, record) => (
        <Button type='danger' shape='circle' size='small'>
            <Icon type='delete' />
        </Button>
    )
}];

const data = [
    {name: '假账号 - 1', platfrom: '百家号', articles: 19},
    {name: '假账号 - 2', platfrom: '百家号', articles: 219},
    {name: '假账号 - 3', platfrom: '企鹅号', articles: 3219},
    {name: '假账号 - 4', platfrom: '企鹅号', articles: 1239},
    {name: '假账号 - 5', platfrom: '百家号', articles: 191},
    {name: '假账号 - 6', platfrom: '企鹅号', articles: 1},
    {name: '假账号 - 7', platfrom: '百家号', articles: 169},
    {name: '假账号 - 8', platfrom: '百家号', articles: 819}
];

export default class AdminUsers extends Component {
    render () {
        return (
            <Page className={style.container}>
                <Table
                    rowKey='name'
                    columns={columns}
                    dataSource={data}
                />
            </Page>
        );
    }
}
