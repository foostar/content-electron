import React, {Component} from 'react';
import Page from 'components/Page';
import style from './style.styl';

export default class extends Component {
    render () {
        return (
            <Page>
                <div className={style.bg} />
            </Page>
        );
    }
}
