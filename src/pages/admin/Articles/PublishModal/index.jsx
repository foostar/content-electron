import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as articlesActions from 'reducers/articles';
import * as upstreamsActions from 'reducers/upstreams';
import {merge} from 'lodash';

import style from './style.styl';
import {Modal, Steps} from 'antd';

import ChooseUpstream from './ChooseUpstream';
import PublishContent from './PublishContent';

const {Step} = Steps;

const mapStateToProps = (state, props) => {
    return {
        upstreams: state.upstreams.data
    };
};
const mapDispatchToProps = dispatch => {
    return {
        articlesActions: bindActionCreators(articlesActions, dispatch),
        upstreamsActions: bindActionCreators(upstreamsActions, dispatch)
    };
};

@connect(mapStateToProps, mapDispatchToProps)
class PublishModal extends Component {
    state = {
        visible: false,
        current: 0,
        data: {}
    }
    showModal = () => {
        this.props.upstreamsActions.fetchUpstreams();
        this.setState({visible: true});
    }
    onCancel = () => {
        this.setState({visible: false});
    }
    nextStep = (data) => {
        if (data === 'success') {
            return this.onCancel();
        }
        const {current} = this.state;
        if (current !== 2) {
            this.setState({
                current: current + 1,
                data: merge({}, data, this.state.data)
            });
        }
    }
    clearData = () => {
        this.setState({
            current: 0,
            data: {}
        });
    }
    render () {
        const {content, upstreams} = this.props;
        const {bindUpstreams} = content.author;
        const {current, visible, data} = this.state;

        const steps = [
            '选择平台',
            '发布文章',
            '确认完成'
        ];
        console.log('@@@@@@@@@@@@', this.props);

        return (
            <span>
                <a onClick={this.showModal}>发布</a>
                <Modal
                    className={style['publish-modal']}
                    width='auto'
                    footer={false}
                    visible={visible}
                    title='发布文章'
                    onCancel={this.onCancel}
                    afterClose={this.clearData}
                >
                    <Steps current={current}>
                        {steps.map(title => <Step key={title} title={title} />)}
                    </Steps>
                    <div className={style['steps-content']}>
                        {current === 0 &&
                            <ChooseUpstream
                                bindUpstreams={bindUpstreams}
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
                    </div>
                </Modal>
            </span>
        );
    }
}

export default PublishModal;
