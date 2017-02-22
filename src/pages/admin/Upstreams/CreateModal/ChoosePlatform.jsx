import React, {Component} from 'react';
import {Row, Col, Card} from 'antd';

import qieLogo from './qi-e-logo.png';
import baiJiaLogo from './bai-jia-logo.png';

import style from './style.styl';

class ChoosePlatform extends Component {
    render () {
        const platforms = [{
            name: '企鹅号',
            logo: qieLogo
        }, {
            name: '百家号',
            logo: baiJiaLogo
        }];
        return (
            <Row gutter={16} style={{padding: 3}}>
                {platforms.map(item => (
                    <Col
                        xs={12}
                        sm={8}
                        md={6}
                        lg={4}
                        key={item.name}
                        onClick={() => this.props.nextStep({platform: item.name})}
                    >
                        <Card className={style['platform-card']}>
                            <div
                                className={style.logo}
                                style={{backgroundImage: `url(${item.logo})`}}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    }
}

export default ChoosePlatform;
