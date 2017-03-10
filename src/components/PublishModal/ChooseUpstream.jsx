import React, {Component} from 'react';
import {platformsById} from 'lib/platforms';

import style from './style.styl';
import {Card} from 'antd';

class ChooseUpstream extends Component {
    render () {
        const {visibleUpstreams, upstreams} = this.props;

        const list = visibleUpstreams === 'all'
            ? upstreams
            : upstreams.filter(u => visibleUpstreams.includes(u.id));

        return (
            <div>
                {list.map((upstream, idx) => (
                    <Card key={idx} className={style['platform-card']} onClick={() => this.props.nextStep({upstream})}>
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

export default ChooseUpstream;
