import React, {Component} from 'react';
import {Card} from 'antd';

import style from './style.styl';
import platforms from 'lib/platforms';

class ChoosePlatform extends Component {
    render () {
        return (
            <div className={style.platforms}>
                {platforms.map((item, idx) =>
                    <Card
                        key={idx}
                        className={style['platform-card'] + (item.disabled ? ` ${style['platform-disabled']}` : '')}
                        onClick={() => item.disabled || this.props.nextStep({platform: item.id})}>
                        <div
                            className={style.logo}
                            style={{backgroundImage: `url(${item.logo})`}}
                        />
                        <div className={style['platform-name']}>{item.name}</div>
                    </Card>
                )}
            </div>
        );
    }
}

export default ChoosePlatform;
