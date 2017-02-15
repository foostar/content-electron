import React, {Component} from 'react';
import {Table, Icon} from 'antd';
import Page from 'components/Page';
import style from './style.styl';

const columns = [{
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: text => <a>{text}</a>
}, {
    title: 'Age',
    dataIndex: 'age',
    key: 'age'
}, {
    title: 'Address',
    dataIndex: 'address',
    key: 'address'
}, {
    title: 'Action',
    key: 'action',
    render: (text, record) => (
        <span>
            <a>Action 一 {record.name}</a>
            <span className='ant-divider' />
            <a>Delete</a>
            <span className='ant-divider' />
            <a className='ant-dropdown-link'>
                <span>More actions</span>
                <Icon type='down' />
            </a>
        </span>
  )
}];

const data = [...Array(100)].map((_, idx) => {
    return {
        key: idx,
        name: `John Brown - ${idx}`,
        age: idx,
        address: `New York No. ${idx} Lake Park`
    };
});

export default class AdminUsers extends Component {
    render () {
        return (
            <Page className={style.container}>
                <Table
                    columns={columns}
                    dataSource={data}
                />
            </Page>
        );
    }
}
