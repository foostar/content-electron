import React from 'react';
import {Button} from 'antd';
import style from './style.styl';

export default class TableAction extends React.Component {
    render () {
        const {data, action} = this.props;
        const handles = data.map((v, index) => {
            return <Button type='primary' key={index} onClick={() => action(v.type, v)}>{v.name}</Button>;
        });
        return (
            <div className={style.tablehandle}>
                { handles }
            </div>
        );
    }
}
