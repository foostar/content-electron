import React, {Component} from 'react';
import {Row, Col, Card} from 'antd';

import style from './style.styl';

export default class ChoosePlatform extends Component {
    render () {
        const platforms = [{
            name: '企鹅号',
            logo: 'https://mats.gtimg.com/om/om_2.0/images/om_logo_header.png'
        }, {
            name: '百家号',
            logo: 'http://bjh.bdstatic.com/bjh/content/static/img/logo-bg-white_8e6fbd7.png'
        }];
        return (
            <Row gutter={16}>
                {platforms.map(item => (
                    <Col
                        xs={12}
                        sm={8}
                        md={6}
                        lg={4}
                        key={item.name}
                        onClick={this.props.nextStep}
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
