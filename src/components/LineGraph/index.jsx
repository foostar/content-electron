import React, {Component} from 'react';
import createG2 from 'g2-react';
// import {Stat} from 'g2';

class LineGraph extends Component {
    shouldComponentUpdate (nextProps, nextState) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            delete this.timer;
        }, 5000);
        if (this.timer) {
            return false;
        }
        return this.props.data !== nextProps.data;
    }

    render () {
        const {data, height = 500} = this.props;
        const max = data.length > 0
            ? data.reduce((n, o) => Number(n) > Number(o.view) ? n : o.view, 0)
            : 1000;

        const Line = createG2(chart => {
            chart.col('view', {
                alias: 'PV',
                max,
                min: 0
            });
            chart.axis('day', {
                title: null
            });
            chart.legend({
                position: 'bottom'
            });
            chart.line().position('day*view').color('平台账号').shape('spline').size(3);
            chart.render();
        });
        return (
            <Line
                data={data}
                width={window.innerWidth - 150}
                height={height}
            />
        );
    }
}

export default LineGraph;
