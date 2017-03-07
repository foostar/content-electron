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
        loading: false,
        selectUps: [],
        statData: [],
        upsData: [],
        startTime: moment().subtract(30, 'days').valueOf(),
        endTime: Date.now() - 1000 * 60 * 60 * 24
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

        mapLimit(upps, 2, (x, done) => {
            console.log(x);
            this.fetchSingleUpstreamStat(x).then((result) => {
                console.log(result);
                done(null, result);
            }, done);
        }, (err, upsData) => {
            if (err) {
                this.setState({
                    loading: false
                });
            }
            const statData = [];
            upsData.forEach(stat => {
                statData.push(...stat.data);
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
        return {
            upstreamId,
            name,
            data
        };
    }

    render () {
        const treeData = [
            {
                label: '百家号',
                value: 'baijia',
                children: this.props.upstreams.filter(x => x.platform === 'baijia').map(item => {
                    return {
                        label: item.nickname,
                        value: item.id
                    };
                })
            },
            {
                label: '企鹅号',
                value: 'omqq',
                children: this.props.upstreams.filter(x => x.platform === 'omqq').map(item => {
                    return {
                        label: item.nickname,
                        value: item.id
                    };
                })

            }
        ];
        return (
            <Spin spinning={this.state.loading}>
                <div style={{textAlign: 'center'}}>
                    <RangePicker
                        size='large'
                        onChange={this.changeDateRange}
                        value={[moment(this.state.startTime), moment(this.state.endTime)]}
                        disabledDate={current => current && current.valueOf() > (Date.now() - 1000 * 60 * 60 * 24)}
                    />
                    {' '}
                    <TreeSelect
                        size='large'
                        style={{minWidth: 300}}
                        multiple
                        treeDefaultExpandAll
                        treeCheckable
                        searchPlaceholder='请选择平台需要查看的平台账号'
                        value={this.state.selectUps}
                        onChange={this.changeUps}
                        treeData={treeData}
                    />
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
                    <Button
                        size='large'
                        icon='search'
                        className={style['search-btn']}
                        onClick={this.fetchUpstreamsStat}
                    >
                        搜索
                    </Button>
                </div>
                <br />
                <LineGraph width={900} data={this.state.statData} />
                <br />
                <Table
                    bordered
                    style={{margin: '0 50px'}}
                    rowKey='upstreamId'
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
                        key='view'
                        dataIndex='data'
                        sorter={(a, b) => a - b}
                        render={(data) => data.reduce((view, b) => view + Number(b.view), 0)}
                    />
                </Table>

            </Spin>
        );
    }
}

export default StatByPlatform;
