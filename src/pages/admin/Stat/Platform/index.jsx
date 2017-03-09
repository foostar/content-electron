import React, {Component} from 'react';
import style from './style.styl';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
// import {uniqBy} from 'lodash';
// import {Link} from 'react-router';
import mapLimit from 'async/mapLimit';

import moment from 'moment';
import LineGraph from 'components/LineGraph';
import * as upstreamsActions from 'reducers/upstreams';
import * as reproductionActions from 'reducers/reproduction';

import OMQQPlatform from 'lib/omqq-platform';
import BaiJiaPlatform from 'lib/baijia-platform';
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

const DAY = 1000 * 60 * 60 * 24;

@connect(mapStateToProps, mapDispatchToProps)
class StatByPlatform extends Component {
    state = {
        loading: false,
        selectUps: [],
        statData: [],
        upsData: [],
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
        this.setState({
            loading: true,
            statData: [],
            upsData: []
        });

        const upps = this.props.upstreams.filter(x => this.state.selectUps.includes(x.id));

        mapLimit(upps, 2, (item, done) => {
            this.fetchSingleUpstreamStat(item).then((result) => done(null, result)).catch(done);
        }, (err, dataArr) => {
            if (err) {
                this.setState({
                    loading: false
                });
            }
            const statData = [];
            const upsData = dataArr.map(stat => {
                statData.push(...stat.data);
                return {
                    name: stat.name,
                    total: stat.data.reduce((view, b) => view + Number(b.view), 0)
                };
            });
            this.setState({
                statData,
                upsData,
                loading: false
            });
        });
    }

    fetchSingleUpstreamStat = async (ups) => {
        const {id: upstreamId, platform, nickname} = ups;
        let wP;
        switch (platform) {
            case 'omqq':
                wP = new OMQQPlatform(ups);
                break;
            case 'baijia':
                wP = new BaiJiaPlatform(ups);
                break;
            default:
                throw Error('didididi~~~');
        }
        const {startTime, endTime} = this.state;
        const data = await wP.statByUpstream(startTime, endTime);
        const name = `[${platformsById[platform].name}] ${nickname}`;
        data.forEach(item => {
            item['平台账号'] = name;
        });
        return {upstreamId, name, data};
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
                <LineGraph width={900} data={this.state.statData} />
                <br />
                <Table
                    bordered
                    style={{margin: '0 50px'}}
                    rowKey='name'
                    pagination={false}
                    dataSource={this.state.upsData}
                >
                    <Column
                        title='[平台] 账号昵称'
                        dataIndex='name'
                        width={'50%'}
                        // render={(name, recod) => <Link to={`/admin/stat/${recod.upstreamId}`}>{name}</Link>}
                    />
                    <Column
                        width={'50%'}
                        title='该时段该 PV 总数'
                        key='total'
                        dataIndex='total'
                    />
                </Table>

            </Spin>
        );
    }
}

export default StatByPlatform;
