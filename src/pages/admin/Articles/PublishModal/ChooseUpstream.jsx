import React, {Component} from 'react';

// import qieLogo from 'pages/admin/Upstreams/CreateModal/qi-e-logo.png';
// import baiJiaLogo from 'pages/admin/Upstreams/CreateModal/bai-jia-logo.png';

import {platformsById} from 'lib/platforms';

import style from './style.styl';
import {Card} from 'antd';

class ChoosePlatform extends Component {
    render () {
        const {visibleUpstreams, upstreams} = this.props;

        const list = visibleUpstreams
            ? upstreams.filter(u => visibleUpstreams.includes(u))
            : upstreams;

        return (
            <div>
                {list.map(upstream => (
                    <Card className={style['platform-card']} onClick={() => this.props.nextStep({upstream})}>
                        <div
                            className={style.logo}
                            style={{backgroundImage: `url(${platformsById[upstream.platform].logo})`}}
                        />
                        <div className={style['upstream-name']}>
                            {upstream.nickname}
                        </div>
                    </Card>

                ))}
            </div>
        );
    }
}

export default ChoosePlatform;
