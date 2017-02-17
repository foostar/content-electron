import React, {Component} from 'react';
import {Modal, Steps, Button, Icon} from 'antd';
import style from './style.styl';

import ChoosePlatform from './ChoosePlatform';
import SigninPlatform from './SigninPlatform';
import CreateDone from './CreateDone';

const Step = Steps.Step;

export default class CreateModal extends Component {
    state = {
        visible: false,
        current: 0
    }
    showModal = () => {
        this.setState({visible: true});
    }
    handleOk = () => {
        const {current} = this.state;
        if (current === 2) {
            this.setState({visible: false});
        } else {
            this.setState({current: current + 1});
        }
    }
    handleCancel = () => {
        this.setState({visible: false});
    }
    clearData = () => {
        this.setState({current: 0});
    }
    nextStep = () => {
        const {current} = this.state;
        if (current === 2) return;
        this.setState({
            current: this.state.current + 1
        });
    }
    render () {
        const {current} = this.state;
        return (
            <div>
                <Button
                    type='primary'
                    shape='circle'
                    size='small'
                    onClick={this.showModal}
                >
                    <Icon type='plus' />
                </Button>
                <Modal
                    title='创建 Upstream'
                    width='auto'
                    className={style['create-modal']}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    afterClose={this.clearData}
                    footer={null}
                >
                    <Steps current={current}>
                        <Step key='1' title='选择平台' />
                        <Step key='2' title='登录平台' />
                        <Step key='3' title='创建完成' />
                    </Steps>
                    <div className={style['steps-content']}>
                        {this.state.current === 0 && <ChoosePlatform nextStep={this.nextStep} />}
                        {this.state.current === 1 && <SigninPlatform nextStep={this.nextStep} /> }
                        {this.state.current === 2 && <CreateDone nextStep={this.nextStep} /> }
                    </div>
                </Modal>
            </div>
        );
    }
}

