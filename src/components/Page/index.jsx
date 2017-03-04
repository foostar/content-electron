import React from 'react';

import style from './style.styl';

export default props => {
    const {className = '', ...res} = props;
    return (
        <div {...res} className={`${style.page} ${className}`}>
            {props.children}
        </div>
    );
};
