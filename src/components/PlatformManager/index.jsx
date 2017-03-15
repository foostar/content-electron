import _ from 'lodash';
import React from 'react';
import style from './style.styl';
import {platformsById} from 'lib/platforms';
import {Modal, Checkbox, Tag, Button, notification} from 'antd';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as managerActions from 'reducers/manager';
import * as reproductionActions from 'reducers/reproduction';
import Webview from './Webview';

const CheckboxGroup = Checkbox.Group;

const mapStateToProps = (state, props) => {
    return {
        manager: state.manager
    };
};
const mapDispatchToProps = dispatch => {
    return {
        reproduction: bindActionCreators(reproductionActions, dispatch),
        managerActions: bindActionCreators(managerActions, dispatch)
    };
};

const stringMapping = {
    'login': '登录中',
    'publish': '发布中',
    'check-login': '检查登陆状态',
    'stat-by-content': '统计中',
    'stat-by-upstream': '统计中'
};

@connect(mapStateToProps, mapDispatchToProps, (ownProps, stateProps, dispatchProps) => Object.assign({}, ownProps, stateProps, dispatchProps), {withRef: true})
export default class PlatformManager extends React.Component {
    constructor (props) {
        super(props);
        const {upstreams} = this.props;
        this.platforms = upstreams.map(this.addPlatform.bind(this));
        this.state = {
            browserVisible: false,
            tasks: {},
            closed: false,
            tree: _.chain(upstreams)
                .map(x => Object.assign({}, x))
                .groupBy('platform')
                .toPairs()
                .map(function (currentItem) {
                    const platform = _.zipObject(['platform', 'accounts'], currentItem);
                    Object.assign(platform, {
                        checkedList: [],
                        indeterminate: false,
                        checkAll: false
                    });
                    return platform;
                }).value()
        };
    }
    getPlatform (id) {
        return _.find(this.platforms, {id});
    }
    addPlatform (account) {
        const platform = new platformsById[account.platform].Class(account);
        platform.addListener('tasks-update', (task, status, tasks) => {
            this.setState({
                tasks: Object.assign({}, this.state.tasks, {
                    [platform.id]: tasks.map(x => {
                        return Object.assign({
                            tips: stringMapping[x.name]
                        }, x);
                    })
                })
            });
        });
        platform.addListener('publish-success', () => {
            notification.success({
                message: '发布完成',
                description: '文章已发布完成！'
            });
        });
        return platform;
    }
    componentDidMount () {
    }
    closeBrowser = () => {
        this.setState({
            browserVisible: false
        });
    }
    onSelectTask = taskId => {
        this.setState({
            selectedTask: taskId,
            browserVisible: true
        });
    }
    onSelectAccountChange = (platform, checkedList) => {
        const {tree} = this.state;
        const checkbox = _.find(tree, {platform});
        Object.assign(checkbox, {
            checkedList,
            indeterminate: !!checkedList.length && (checkedList.length < checkbox.accounts.length),
            checkAll: checkedList.length === checkbox.accounts.length
        });
        this.setState({tree});
    }
    onSelectAccountCheckAllChange = (platform, e) => {
        const {tree} = this.state;
        const checkbox = _.find(tree, {platform});
        Object.assign(checkbox, {
            checkedList: e.target.checked ? checkbox.accounts.map(x => x.id) : [],
            indeterminate: false,
            checkAll: e.target.checked
        });
        this.setState({tree});
    }
    onSelectAccount = () => {
        const {tree} = this.state;
        const {manager, reproduction} = this.props;
        this.platforms
            .filter(x => _.flatten(tree.map(x => x.checkedList)).includes(x.id))
            .forEach(async x => {
                const link = await x.publish(manager.content.title, manager.content);
                await reproduction.upsert({
                    body: {
                        link,
                        content: manager.content.id,
                        upstream: x.id
                    }
                });
            });
        this.setState({
            browserVisible: true
        });
        this.props.managerActions.selectAccount();
    }
    onSelectAccountCancel = () => {
        this.props.managerActions.selectAccount();
    }
    toggle = () => {
        this.setState({
            closed: !this.state.closed
        });
    }
    render () {
        const {upstreams, manager} = this.props;
        const {tree, tasks, selectedTask, browserVisible, closed} = this.state;
        const tabs = _.transform(tasks, (result, value, key) => {
            const account = _.find(upstreams, {id: key});
            result.push.apply(result, value.map(x => Object.assign({
                platform: platformsById[account.platform],
                account
            }, x)));
        }, []);
        const tabId = selectedTask || (tabs[0] ? tabs[0].id : null);
        upstreams.sort((a, b) => {
            a = tasks[a.id];
            b = tasks[b.id];
            if (a && a.length && b && b.length) {
                return a.length - b.length;
            }
            if (a && a.length) {
                return -1;
            }
            return 1;
        });
        return (
            <div>
                <div className={style.container + (closed ? ` ${style['upstreams-closed']}` : '')}>
                    <div className={style['upstreams-title']} onClick={this.toggle}>
                        我的账号
                    </div>
                    <div className={style['upstreams-list']}>
                        {upstreams.map(({id, platform, nickname}) => (
                            <div className={style.upstream} key={id}>
                                <div className={style['upstream-header']}>
                                    <div className={style['upstream-logo']}>
                                        <img src={platformsById[platform].logo} />
                                    </div>
                                    <div className={style['upstream-name']}>
                                        {nickname}
                                    </div>
                                </div>
                                <div className={style['upstream-content']}>
                                    {tasks[id] && tasks[id].length ? tasks[id].map(x => (
                                        <Tag onClick={() => this.onSelectTask(x.id)} key={x.id}>{x.tips}</Tag>
                                    )) : <div style={{lineHeight: '22px'}}>暂无任务</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {!!upstreams.length || (<div className={style.upstream}>暂无账号</div>)}
                <Modal
                    title='选择账号'
                    visible={manager.isAccountSelecting}
                    onCancel={this.onSelectAccountCancel}
                    onOk={this.onSelectAccount}
                    >
                    {
                        tree.map(({platform, accounts, checkAll, checkedList, indeterminate}) => (
                            <div key={platform} className={style['checkbox-group']}>
                                <div className={style['checkbox-group-all']}>
                                    <Checkbox
                                        indeterminate={indeterminate}
                                        onChange={e => {
                                            this.onSelectAccountCheckAllChange(platform, e);
                                        }}
                                        checked={checkAll}
                                    >
                                        {platformsById[platform].name}
                                    </Checkbox>
                                </div>
                                <CheckboxGroup
                                    className={style['checkbox-group-list']}
                                    options={accounts.map(x => ({
                                        label: x.nickname,
                                        value: x.id
                                    }))}
                                    value={checkedList}
                                    onChange={list => {
                                        this.onSelectAccountChange(platform, list);
                                    }} />
                            </div>
                        ))
                    }
                </Modal>
                <div className={style.browser} style={{width: (browserVisible && tabs.length) ? '100%' : '0'}}>
                    <div className={style['browser-header']}>
                        <div className={style['browser-tabbars']}>
                            {tabs.map(({id, tips, account, platform, complete}) => (
                                <div
                                    key={id}
                                    onClick={() => this.onSelectTask(id)}
                                    className={style['browser-tabbar'] + (tabId === id ? ` ${style['browser-tabbar-active']}` : '')}>
                                    {account.nickname} [{platform.name} - {tips}]
                                    <Button shape='circle' icon='close' className={style['browser-tab-close']} onClick={complete} />
                                </div>))}
                        </div>
                        <Button shape='circle' icon='close' className={style['browser-close']} onClick={this.closeBrowser} />
                    </div>
                    <div className={style['browser-content']}>
                        {tabs.map(({id, webview}) => (
                            <Webview key={id} webview={webview} visible={id === tabId} className={style['browser-webview']} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }
};
