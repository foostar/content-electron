import React, {Component} from 'react';
import style from './style.styl';
import {connect} from 'react-redux';
import moment from 'moment';
import {bindActionCreators} from 'redux';
import * as upstreamsActions from 'reducers/upstreams';
import * as reproductionActions from 'reducers/reproduction';
import * as usersActions from 'reducers/users';

import {Table, DatePicker, Button, message} from 'antd';

const {RangePicker} = DatePicker;
const {Column} = Table;

const mapStateToProps = state => {
    return {
        users: state.users.data,
        upstreams: state.upstreams.data,
        statByRedactor: state.reproduction.redactor
    };
};
const mapDispatchToProps = dispatch => {
    return {
        usersActions: bindActionCreators(usersActions, dispatch),
        upstreamsActions: bindActionCreators(upstreamsActions, dispatch),
        reproductionActions: bindActionCreators(reproductionActions, dispatch)
    };
};

@connect(mapStateToProps, mapDispatchToProps)
class StatByRedactor extends Component {
    state = {
        publishStart: moment().subtract(30, 'days').valueOf(),
        publishEnd: Date.now()
    }
    componentDidMount () {
        if (!this.props.users.length) {
            this.props.usersActions.fetchUsers();
        }

        if (!Object.keys(this.props.statByRedactor).length) {
            this.queryStat();
        }
    }

    queryStat = async () => {
        const {publishStart, publishEnd} = this.state;
        this.props.reproductionActions.fetchStatGroupByRedactor({
            query: {
                publishStart,
                publishEnd
            }
        });
        message.success('查询成功');
    }

    changeDateRange = ([start, end]) => {
        this.setState({
            publishStart: start.valueOf(),
            publishEnd: end.valueOf()
        });
    }
    render () {
        const dataSource = this.props.users.filter(u => u.level === 2);
        return (
            <div>
                <div>
                    <RangePicker
                        size='large'
                        onChange={this.changeDateRange}
                        value={[moment(this.state.publishStart), moment(this.state.publishEnd)]}
                        disabledDate={current => current && current.valueOf() > Date.now()}
                    />
                    <Button
                        size='large'
                        icon='search'
                        className={style['search-btn']}
                        onClick={this.queryStat}
                    >
                        搜索
                    </Button>
                </div>
                <br />
                <Table
                    bordered
                    rowKey='id'
                    pagination={false}
                    dataSource={dataSource}
                >
                    <Column
                        title='账号'
                        key='username'
                        dataIndex='username'
                    />
                    <Column
                        title='产生PV'
                        key='views'
                        sorter={(a, b) => {
                            const aStat = this.props.statByRedactor[a.id] || {total: 0};
                            const bStat = this.props.statByRedactor[b.id] || {total: 0};
                            return aStat.total - bStat.total;
                        }}
                        render={(_, user) => {
                            let views = '无数据';
                            try {
                                views = this.props.statByRedactor[user.id].total;
                            } catch (err) { }
                            return <span>{views}</span>;
                        }}
                    />
                </Table>
            </div>
        );
    }
}

export default StatByRedactor;
