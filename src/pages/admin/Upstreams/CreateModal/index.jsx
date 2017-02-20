import React, {Component} from 'react';
import {Modal, Steps, Button, Icon} from 'antd';
import {merge} from 'lodash';
import ChoosePlatform from './ChoosePlatform';
import InputAccount from './InputAccount';
import SigninPlatform from './SigninPlatform';
import CreateDone from './CreateDone';

import style from './style.styl';

const Step = Steps.Step;

class CreateModal extends Component {
    state = {
        visible: false,
        current: 0,
        data: {}
    }
    clearData = () => {
        this.setState({
            visible: false,
            current: 0,
            data: {}
        });
    }
    nextStep = (data) => {
        if (data === 'success') {
            return this.clearData();
        }
        const {current} = this.state;
        this.setState({
            data: merge({}, this.state.data, data)
        });

        if (current === 3) return;
        this.setState({current: this.state.current + 1});
    }
    render () {
        const {current} = this.state;
        const steps = [
            '选择平台',
            '填写账号',
            '登录平台',
            '确认信息'
        ];
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
                    title={steps[this.state.current]}
                    width='auto'
                    className={style['create-modal']}
                    visible={this.state.visible}
                    onCancel={this.clearData}
                    afterClose={this.clearData}
                    footer={null}
                >
                    <Steps current={current}>
                        {steps.map(title => <Step key={title} title={title} />)}
                    </Steps>

                    <div className={style['steps-content']}>
                        {this.state.current === 0 &&
                            <ChoosePlatform nextStep={this.nextStep} />
                        }
                        {this.state.current === 1 &&
                            <InputAccount data={this.state.data} nextStep={this.nextStep} />
                        }
                        {this.state.current === 2 &&
                            <SigninPlatform data={this.state.data} nextStep={this.nextStep} />
                        }
                        {this.state.current === 3 &&
                            <CreateDone data={this.state.data} nextStep={this.nextStep} />
                        }
                    </div>
                </Modal>
            </div>
        );
    }
}

export default CreateModal;
