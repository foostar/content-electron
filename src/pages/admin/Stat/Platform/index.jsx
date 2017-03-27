import React, {Component} from 'react';
import style from './style.styl';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
// import {uniqBy} from 'lodash';
// import {Link} from 'react-router';
import eachLimit from 'async/eachLimit';
import app from 'lib/app';

import moment from 'moment';
// import LineGraph from 'components/LineGraph';
import * as upstreamsActions from 'reducers/upstreams';
import * as reproductionActions from 'reducers/reproduction';

import {platformsById} from 'lib/platforms';

import {Table, DatePicker, Button, TreeSelect, Spin} from 'antd';

const {RangePicker} = DatePicker;
const {Column} = Table;
// const Option = Select.Option;
// const OptGroup = Select.OptGroup;

const mapStateToProps = state => {
    return {
        passport: state.passport.data,
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

const timeout = (ms, promise, err = new Error('timeout')) => new Promise((resolve, reject) => {
    setTimeout(() => {
        reject(err);
    }, ms);
    promise.then(resolve, reject);
});

const DAY = 1000 * 60 * 60 * 24;

@connect(mapStateToProps, mapDispatchToProps)
class StatByPlatform extends Component {
    state = {
        loading: false,
        selectUps: [],
        statData: [],
        // upsData: [],
        startTime: Math.floor((Date.now() - 30 * DAY) / DAY) * DAY,
        endTime: Math.floor((Date.now() - DAY) / DAY) * DAY
    }
    componentDidMount () {
        // if (!Object.keys(this.props.statByUpstream).length) {
        //     this.queryStat();
        // }
        if (!this.props.upstreams.length) {
            this.props.upstreamsActions.fetchUpstreams();
        }
    }

    changeDateRange = ([start, end]) => {
        this.setState({
            startTime: start.valueOf(),
            endTime: end.valueOf()
        });
    }

    changeUps = (selectUps) => {
        this.setState({
            selectUps
        });
    }

    fetchUpstreamsStat = async () => {
        const upps = this.props.upstreams.filter(x => this.state.selectUps.includes(x.id));

        this.setState({
            // loading: true,
            // statData: [],
            statData: upps.map(x => {
                return {
                    id: x.id,
                    name: x.nickname,
                    totalIncome: '-',
                    totalView: '-',
                    status: 'initial',
                    data: []
                };
            })
        }, () => {
            eachLimit(upps, 5, (item, done) => {
                this.fetchSingleUpstreamStat(item)
                    .then(() => done())
                    .catch(() => done());
            }, console.error);
        });
    }
    fetchSingleUpstreamStat = ups => {
        const oldStat = this.state.statData.find((stat) => {
            return stat.id === ups.id;
        });
        oldStat.status = 'fetching';
        const fetch = async () => {
            const {id: upstreamId, platform, nickname} = ups;
            const manager = app.getManager();
            const wP = manager.getPlatform(upstreamId);
            const {startTime, endTime} = this.state;
            const data = await wP.statByUpstream(startTime, endTime);
            const name = `[${platformsById[platform].name}] ${nickname}`;
            data.forEach(item => {
                item['平台账号'] = name;
            });
            return {upstreamId, name, data};
        };
        return timeout(20000, fetch())
            .then((result) => {
                oldStat.totalIncome = result.data.reduce((income, b) => income + Number(b.income || 0), 0);
                oldStat.totalView = result.data.reduce((view, b) => view + Number(b.view || 0), 0);
                oldStat.data = result.data;
                oldStat.status = 'success';
                this.setState(this.state);
            })
            .catch((err) => {
                oldStat.totalIncome = '-';
                oldStat.totalView = '-';
                oldStat.status = 'error';
                this.setState(this.state);
                return Promise.reject(err);
            });
    }

    render () {
        const treeData = [
            {
                label: '百家号',
                value: 'baijia',
                children: this.props.upstreams.filter(x => {
                    const f1 = x.platform === 'baijia';
                    let f2 = true;
                    if (this.props.passport.level === 2) {
                        f2 = this.props.passport.bindUpstreams.includes(x.id);
                    }
                    return f1 && f2;
                }).map(item => {
                    return {
                        label: item.nickname,
                        value: item.id
                    };
                })
            },
            {
                label: '企鹅号',
                value: 'omqq',
                children: this.props.upstreams.filter(x => {
                    const f1 = x.platform === 'omqq';
                    let f2 = true;
                    if (this.props.passport.level === 2) {
                        f2 = this.props.passport.bindUpstreams.includes(x.id);
                    }
                    return f1 && f2;
                }).map(item => {
                    return {
                        label: item.nickname,
                        value: item.id
                    };
                })

            }
        ].filter(x => x.children.length);
        return (
            <Spin spinning={this.state.loading}>
                <div style={{textAlign: 'center'}}>
                    <div>
                        <TreeSelect
                            size='large'
                            style={{width: 800}}
                            multiple
                            treeDefaultExpandAll
                            treeCheckable
                            searchPlaceholder='请选择平台需要查看的平台账号'
                            value={this.state.selectUps}
                            onChange={this.changeUps}
                            treeData={treeData}
                        />
                    </div>
                    <br />
                    <div>
                        <RangePicker
                            size='large'
                            onChange={this.changeDateRange}
                            value={[moment(this.state.startTime), moment(this.state.endTime)]}
                            disabledDate={current => current && current.valueOf() > (Date.now() - 1000 * 60 * 60 * 24)}
                        />
                        <Button
                            size='large'
                            icon='search'
                            className={style['search-btn']}
                            onClick={this.fetchUpstreamsStat}
                        >
                            搜索
                        </Button>
                    </div>
                    {/*
                    <Select
                        multiple
                        size='large'
                        placeholder='请选择平台需要查看的平台账号'
                        style={{width: 400}}
                        onChange={this.changeUps}
                    >
                        <OptGroup label='百家号' key='baijia' onClick={console.log}>
                            {this.props.upstreams.filter(x => x.platform === 'baijia').map((item, idx) =>
                                <Option key={idx} value={item.id}>{item.nickname}</Option>
                            )}
                        </OptGroup>
                        <OptGroup label='企鹅号' key='omqq'>
                            {this.props.upstreams.filter(x => x.platform === 'omqq').map((item, idx) =>
                                <Option key={idx} value={item.id}>{item.nickname}</Option>
                            )}
                        </OptGroup>
                    </Select>
                    */}
                </div>
                <br />
                {/* <LineGraph width={900} height={300} data={[].concat.apply([], this.state.statData.map(x => x.data))} /> */}
                <br />
                <Table
                    bordered
                    style={{margin: '0 50px', userSelect: 'initial'}}
                    rowKey='name'
                    pagination={false}
                    rowClassName={(item) => {
                        return style[item.status];
                    }}
                    dataSource={this.state.statData}
                >
                    <Column
                        title='[平台] 账号昵称'
                        dataIndex='name'
                        // render={(name, recod) => <Link to={`/admin/stat/${recod.upstreamId}`}>{name}</Link>}
                    />
                    <Column
                        width='25%'
                        title='该时段 PV 总数'
                        key='totalView'
                        dataIndex='totalView'
                    />
                    {this.props.passport.level === 0 &&
                        <Column
                            width='25%'
                            title='该时段 收入 总数'
                            key='totalIncome'
                            dataIndex='totalIncome'
                        />
                    }
                    <Column
                        width='25%'
                        title='操作'
                        key='action'
                        render={(_, item) => {
                            return (
                                <Button
                                    disabled={item.status !== 'error'}
                                    icon='reload'
                                    shape='circle'
                                    onClick={() => {
                                        this.fetchSingleUpstreamStat(item);
                                    }}
                                    loading={item.status === 'fetching'} />
                            );
                        }}
                    />
                </Table>

            </Spin>
        );
    }
}

export default StatByPlatform;
