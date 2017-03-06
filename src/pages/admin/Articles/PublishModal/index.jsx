import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as articlesActions from 'reducers/articles';
import * as upstreamsActions from 'reducers/upstreams';
import * as reproductionActions from 'reducers/reproduction';
import {merge} from 'lodash';

import style from './style.styl';
import {Modal, Steps, Alert, Button} from 'antd';

import ChooseUpstream from './ChooseUpstream';
import PublishContent from './PublishContent';
import {platformsById} from 'lib/platforms';

const {Step} = Steps;

const mapStateToProps = (state, props) => {
    return {
        passport: state.passport.data,
        upstreams: state.upstreams.data,
        myBindUpstreams: state.passport.data.bindUpstreams,
        myLevel: state.passport.data.level
    };
};
const mapDispatchToProps = dispatch => {
    return {
        reproduction: bindActionCreators(reproductionActions, dispatch),
        articlesActions: bindActionCreators(articlesActions, dispatch),
        upstreamsActions: bindActionCreators(upstreamsActions, dispatch)
    };
};

@connect(mapStateToProps, mapDispatchToProps)
class PublishModal extends Component {
    static defaultProps = {
        beforeShowModal () {
            return true;
        }
    }
    state = {
        visible: false,
        current: 0,
        data: {}
    }
    showModal = async () => {
        if (await this.props.beforeShowModal()) {
            this.props.upstreamsActions.fetchUpstreams();
            this.setState({visible: true});
        }
    }
    onCancel = () => {
        this.setState({visible: false});
    }
    nextStep = async (data) => {
        if (data.link) {
            // link: data.link,
            // data: Date.now() | 20170301,
            // publisher: passport.id
            // content: content.id
            await this.props.reproduction.upsert({
                body: {
                    link: data.link,
                    content: this.props.content.id,
                    upstream: this.state.data.upstream
                }
            });
            return this.onCancel();
        }

        const {current} = this.state;

        // if (current === 2) {
        this.setState({
            current: current + 1,
            data: merge({}, data, this.state.data)
        });
        // }
    }
    clearData = () => {
        this.setState({
            current: 0,
            data: {}
        });
    }
    render () {
        const {content, upstreams} = this.props;
        const {current, visible, data} = this.state;

        const authorBindUpstreams = (content.author || {}).bindUpstreams || [];
        const {myBindUpstreams = []} = this.props;

        let visibleUpstreams;

        if (this.props.myLevel === 0) {
            visibleUpstreams = null;
        } else if (authorBindUpstreams.length === 0) {
            visibleUpstreams = myBindUpstreams;
        } else {
            visibleUpstreams = visibleUpstreams.filter(u => myBindUpstreams.includes(u));
        }

        const steps = [
            '选择账号',
            '发布文章',
            '确认完成'
        ];

        let title = steps[current];
        try {
            title = `[${platformsById[data.upstream.platform].name}] ${data.upstream.nickname || ''}`;
        } catch (err) {}

        return (
            <span>
                <span onClick={this.showModal}>
                    {this.props.children}
                </span>
                <Modal
                    className={style['publish-modal']}
                    width='auto'
                    footer={false}
                    visible={visible}
                    title={title}
                    onCancel={this.onCancel}
                    afterClose={this.clearData}
                >
                    <Steps className={style.steps} current={current}>
                        {steps.map(title => <Step key={title} title={title} />)}
                    </Steps>
                    <div className={style['steps-content']}>
                        {current === 0 &&
                            <ChooseUpstream
                                visibleUpstreams={visibleUpstreams}
                                upstreams={upstreams}
                                nextStep={this.nextStep}
                            />
                        }
                        {current === 1 &&
                            <PublishContent
                                data={data}
                                content={content}
                                nextStep={this.nextStep}
                            />
                        }
                        {current === 2 &&
                            <div style={{width: 500, margin: 'auto'}}>
                                <Alert
                                    message={`${content.title} 发布成功`}
                                    description='请记得增加标签'
                                    type='success'
                                />
                                <Button style={{width: '100%'}} onClick={this.onCancel}>
                                    点击关闭
                                </Button>
                            </div>
                        }
                    </div>
                </Modal>
            </span>
        );
    }
}

export default PublishModal;
