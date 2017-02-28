import React, {Component} from 'react';

import qieLogo from 'pages/admin/Upstreams/CreateModal/qi-e-logo.png';
import baiJiaLogo from 'pages/admin/Upstreams/CreateModal/bai-jia-logo.png';

const BG_LOGO = {
    '企鹅号': qieLogo,
    '百家号': baiJiaLogo
};

import style from './style.styl';
import {Card, Row, Tag, Col} from 'antd';

class ChoosePlatform extends Component {
    render () {
        const {bindUpstreams, upstreams} = this.props;
        return (
            <Row gutter={16} style={{padding: 3}}>
                {upstreams.map(upstream => (
                    <Col
                        key={upstream.id}
                        xs={12} sm={8} md={6} lg={4}
                        onClick={() => this.props.nextStep({upstream})}
                    >
                        <Card className={style['platform-card']}>
                            <div
                                className={style.logo}
                                style={{backgroundImage: `url(${BG_LOGO[upstream.platform]})`}}
                            >
                                <Tag color='green-inverse' className={style['upstream-tag']}>
                                    {upstream.nickname}
                                </Tag>
                                {bindUpstreams.includes(upstream.id) &&
                                    <Tag color='blue' className={style['bind-tag']}>作者绑定平台</Tag>
                                }
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    }
}

export default ChoosePlatform;
