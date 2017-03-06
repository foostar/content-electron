import React, {Component} from 'react';
import style from './style.styl';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {uniqBy} from 'lodash';
import {Link} from 'react-router';
import moment from 'moment';
import * as upstreamsActions from 'reducers/upstreams';
import * as reproductionActions from 'reducers/reproduction';

import OMQQPlatform from 'lib/omqq-platform';
import BaiJiaPlatform from 'lib/baijia-platform';
import {platformsById} from 'lib/platforms';

import {Table, DatePicker, Button, message} from 'antd';

const {RangePicker} = DatePicker;
const {Column} = Table;

const mapStateToProps = state => {
    return {
        upstreams: state.upstreams.data,
        statByUpstream: state.reproduction.upstream
    };
};
const mapDispatchToProps = dispatch => {
    return {
        upstreamsActions: bindActionCreators(upstreamsActions, dispatch),
        reproductionActions: bindActionCreators(reproductionActions, dispatch)
    };
};

@connect(mapStateToProps, mapDispatchToProps)
class StatByPlatform extends Component {
    state = {
        loadingList: [],
        publishStart: moment().subtract(30, 'days').valueOf(),
        publishEnd: Date.now()
    }
    componentDidMount () {
        if (!Object.keys(this.props.statByUpstream).length) {
            this.queryStat();
        }

        if (!this.props.upstreams.length) {
            this.props.upstreamsActions.fetchUpstreams();
        }
    }

    changeDateRange = ([start, end]) => {
        this.setState({
            publishStart: start.valueOf(),
            publishEnd: end.valueOf()
        });
    }

    queryStat = async () => {
        const {publishStart, publishEnd} = this.state;
        await this.props.reproductionActions.fetchStatGroupByUpstream({
            query: {publishStart, publishEnd}
        });
        message.success('查询成功');
    }

    asyncStats = async (ups) => {
        const {id: upstreamId, platform, account, password, session} = ups;

        this.setState({
            loadingList: this.state.loadingList.concat(upstreamId)
        });

        let wP;

        switch (platform) {
            case 'omqq':
                wP = new OMQQPlatform(account, password, session);
                break;
            case 'baijia':
                wP = new BaiJiaPlatform(account, password, session);
                break;
            default:
                throw Error('didididi~~~');
        }

        console.log(await wP.statByUpstream());

        // const data = (await wP.stats()).map(item => {
        //     item.upstream = upstreamId;
        //     return item;
        // });

        // await this.props.reproductionActions.updateMany({body: data});
        // await this.props.reproductionActions.fetchStat();
        // message.success('更新成功');
        // this.setState({
        //     loadingList: this.state.loadingList.filter(x => x !== upstreamId)
        // });
    }

    render () {
        const platTypes = uniqBy(this.props.upstreams, 'platform').map(item => {
            const {platform} = item;
            return {
                text: platformsById[platform].name,
                value: platform
            };
        });
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
                    dataSource={this.props.upstreams}
                >
                    <Column
                        title='[平台] 账号昵称'
                        dataIndex='platform'
                        width={200}
                        filters={platTypes}
                        filterMultiple={false}
                        onFilter={(value, record) => value === record.platform}
                        render={(p, recod) => (
                            <Link to={`/admin/stat/${recod.id}`}>
                                [{platformsById[p].name}] {recod.nickname}
                            </Link>
                        )}
                    />
                    <Column
                        title='平台PV'
                        key='pv'
                        sorter={(a, b) => {
                            const aStat = this.props.statByUpstream[a.id] || {total: 0};
                            const bStat = this.props.statByUpstream[b.id] || {total: 0};
                            return aStat.total - bStat.total;
                        }}
                        dataIndex='id'
                        render={id => {
                            const stat = this.props.statByUpstream[id] || {};
                            return (
                                <span>{stat.total || '无数据'}</span>
                            );
                        }}
                    />
                    <Column
                        title='同步'
                        key='async'
                        render={(_, p) => {
                            const loading = this.state.loadingList.includes(p.id);
                            return (
                                <Button
                                    disabled={loading}
                                    loading={loading}
                                    onClick={() => this.asyncStats(p)}
                                    size='small'
                                    shape='circle'
                                    icon='reload'
                                />
                            );
                        }}
                    />
                </Table>
            </div>
        );
    }
}

export default StatByPlatform;
