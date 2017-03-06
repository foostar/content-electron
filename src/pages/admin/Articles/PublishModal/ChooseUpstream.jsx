import React, {Component} from 'react';
import {platformsById} from 'lib/platforms';

import style from './style.styl';
import {Card, Row, Tag, Col} from 'antd';

class ChoosePlatform extends Component {
    render () {
        const {bindUpstreams, upstreams} = this.props;

        return (
            <div style={{maxWidth: '800px', margin: '0 auto', padding: '30px 0'}}>
                <Row gutter={16}>
                    {upstreams.map(upstream => (
                        <Col
                            key={upstream.id}
                            xs={12} sm={8} md={6} lg={4}
                            onClick={() => this.props.nextStep({upstream})}
                        >
                            <Card className={style['platform-card']}>
                                <div
                                    className={style.logo}
                                    style={{backgroundImage: `url(${platformsById[upstream.platform].logo})`}}
                                >
                                    {upstream.nickname || upstream.custom || '未获取到昵称'}
                                    {bindUpstreams.includes(upstream.id) &&
                                        <Tag color='blue' className={style['bind-tag']}>作者绑定平台</Tag>
                                    }
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        );
    }
}

export default ChoosePlatform;
