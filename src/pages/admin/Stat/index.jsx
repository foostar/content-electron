import React, {Component} from 'react';
import Page from 'components/Page';
import style from './style.styl';
import {connect} from 'react-redux';
import moment from 'moment';
import {bindActionCreators} from 'redux';
import {uniqBy} from 'lodash';
import {Layout, Table, Button, message} from 'antd';
import * as upstreamsActions from 'reducers/upstreams';
import * as reproductionActions from 'reducers/reproduction';

import {platformsById} from 'lib/platforms';

import OMQQPlatform from 'lib/omqq-platform';
import BaiJiaPlatform from 'lib/baijia-platform';

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

const {Column} = Table;
@connect(mapStateToProps, mapDispatchToProps)

class Stats extends Component {
    state = {
        loadingList: []
    }
    componentDidMount () {
        this.props.reproductionActions.fetchStat();
        this.props.upstreamsActions.fetchUpstreams();
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

        const data = (await wP.stats()).map(item => {
            item.upstream = upstreamId;
            return item;
        });

        await this.props.reproductionActions.updateMany({body: {data}});
        await this.props.reproductionActions.fetchStat();

        message.success('更新成功');

        this.setState({
            loadingList: this.state.loadingList.filter(x => x !== upstreamId)
        });
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
            <Page>
                <Layout className={style.layout}>
                    <Layout.Sider width='200' className={style.sider}>
                        <h3>搜索条件</h3>
                        <h1>form</h1>
                    </Layout.Sider>
                    <Layout.Content className={style.content}>
                        <Table
                            bordered
                            rowKey='id'
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
                                    <a>
                                        [{platformsById[p].name}] {recod.nickname}
                                    </a>
                                )}
                            />
                            <Column
                                title='平台PV'
                                key='pv'
                                sorter={(a, b) => {
                                    const aStat = this.props.statByUpstream[a.id] || {};
                                    const bStat = this.props.statByUpstream[b.id] || {};
                                    return aStat.total - bStat.total;
                                }}
                                dataIndex='id'
                                render={id => {
                                    const stat = this.props.statByUpstream[id] || {};
                                    return (
                                        <span>{stat.total}</span>
                                    );
                                }}
                            />
                            <Column
                                title='最后更新时间'
                                key='lastUpdate'
                                dataIndex='platform'
                                render={id => {
                                    const stat = this.props.statByUpstream[id] || {};
                                    return (
                                        <span>{moment(stat.lastUpdate).format('MM-DD a h:mm')}</span>
                                    );
                                }}
                            />
                            <Column
                                title='备注'
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
                    </Layout.Content>
                </Layout>
            </Page>
        );
    }
}

export default Stats;
