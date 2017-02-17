import React, {Component} from 'react';
import Page from 'components/Page';
// import style from './style.styl';

import {Button} from 'antd';

export default class extends Component {
    render () {
        return (
            <Page>
                <div style={{padding: 12}}>
                    <Button>Default</Button>&emsp;
                    <Button type='primary'>Primary</Button>&emsp;
                    <Button type='dashed'>Dashed</Button>&emsp;
                    <Button type='danger'>Danger</Button>&emsp;
                </div>
                <div style={{background: '#333', padding: 12}}>
                    <Button type='primary' ghost>Primary Ghost</Button>&emsp;
                    <Button ghost>Default Ghost</Button>&emsp;
                    <Button type='dashed' ghost>Dashed Ghost</Button>&emsp;
                </div>
                <div style={{padding: 12}}>
                    <Button type='primary' disabled>Primary(disabled)</Button>&emsp;
                    <Button disabled>Default(disabled)</Button>&emsp;
                    <Button disabled>Ghost(disabled)</Button>&emsp;
                    <Button type='dashed' disabled>Dashed(disabled)</Button>&emsp;
                </div>
            </Page>
        );
    }
}
