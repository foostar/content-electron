import React, {Component} from 'react';
import {Modal, Steps, Button, Icon} from 'antd';
import style from './style.styl';

import ChoosePlatform from './ChoosePlatform';
import SigninPlatform from './SigninPlatform';
import CreateDone from './CreateDone';

const Step = Steps.Step;

export default class CreateModal extends Component {
    state = {
        visible: true,
        current: 0,
        data: {}
    }
    clearData = () => {
        this.setState({
            current: 0,
            data: {}
        });
    }
    nextStep = (data) => {
        const {current} = this.state;
        this.setState({data});

        if (current === 2) return;
        this.setState({current: this.state.current + 1});
    }
    render () {
        const {current} = this.state;
        return (
            <div>
                <Button
                    type='primary'
                    shape='circle'
                    size='small'
                    onClick={() => this.setState({visible: true})}
                >
                    <Icon type='plus' />
                </Button>
                <Modal
                    title={JSON.stringify(this.state.data)} // '创建 Upstream'
                    width='auto'
                    className={style['create-modal']}
                    visible={this.state.visible}
                    onCancel={() => this.setState({visible: false})}
                    afterClose={this.clearData}
                    footer={null}
                >
                    <Steps current={current}>
                        <Step title='选择平台' />
                        <Step title='登录平台' />
                        <Step title='创建完成' />
                    </Steps>

                    <div className={style['steps-content']}>
                        {this.state.current === 0 &&
                            <ChoosePlatform platforms={this.state.platforms} nextStep={this.nextStep} />
                        }
                        {this.state.current === 1 &&
                            <SigninPlatform data={this.state.data} nextStep={this.nextStep} />
                        }
                        {this.state.current === 2 &&
                            <CreateDone nextStep={this.nextStep} />
                        }
                    </div>
                </Modal>
            </div>
        );
    }
}

