import React, {Component} from 'react';
import {Modal, message} from 'antd';
import style from './style.styl';
import config from 'config';
import {connect} from 'react-redux';

const mapStateToProps = (state, props) => {
    return {
        token: state.passport.data.token
    };
};

@connect(mapStateToProps)
class MasicImage extends Component {
    static defaultProps = {
        done: function () {}
    }
    state = {visible: true}
    componentDidMount () {
        this.canvas1 = this.refs.canvas1;
        this.canvas2 = this.refs.canvas2;
        this.ctx1 = this.canvas1.getContext('2d');
        this.ctx2 = this.canvas2.getContext('2d');

        if (this.props.src) {
            this.img = document.createElement('IMG');
            this.img.src = this.props.src;
            this.img.onload = this.initImg;
        } else if (this.props.img) {
            this.img = this.props.img;
            this.initImg();
        } else {
            throw Error('Mosaic need prop (img/src)');
        }
    }
    initImg = () => {
        this.canvas2.width = this.img.naturalWidth;
        this.canvas2.height = this.img.naturalHeight;
        this.ctx2.drawImage(this.img, 0, 0);
    }
    onMouseDown = e => {
        e.preventDefault();
        if (this.start) return this.onMouseUp();
        const {clientX, clientY} = e;
        this.start = true;
        this.startX = clientX;
        this.startY = clientY;
        const {left, top} = this.refs.wrap.getBoundingClientRect();
        this.refs.aside.style.left = (this.startX - left) + 'px';
        this.refs.aside.style.top = (this.startY - top) + 'px';
    }
    onMouseMove = e => {
        if (!this.start) return;
        const {clientX, clientY} = e;
        this.diffX = clientX - this.startX;
        this.diffY = clientY - this.startY;
        this.refs.aside.style.width = this.diffX + 'px';
        this.refs.aside.style.height = this.diffY + 'px';
    }
    cutImg = ({left, top, width, height}) => {
        const VIEW_WIDTH = 900;
        const RATE = this.img.naturalWidth / VIEW_WIDTH;
        const SACLE = 0.1;
        const startX = left * RATE;
        const startY = top * RATE;
        const sWidth = width * RATE;
        const sHeight = height * RATE;
        const WIDTH1 = sWidth * SACLE;
        const HEIGHT1 = sHeight * SACLE;
        this.canvas1.width = WIDTH1;
        this.canvas1.height = HEIGHT1;
        this.ctx1.imageSmoothingEnabled = false;
        this.ctx1.drawImage(this.img,
            startX,
            startY,
            sWidth,
            sHeight,
            0,
            0,
            WIDTH1,
            HEIGHT1
        );
        return {startX, startY, WIDTH1, HEIGHT1, sWidth, sHeight};
    }
    pasteMosaic = ({startX, startY, WIDTH1, HEIGHT1, sWidth, sHeight}) => {
        this.ctx2.imageSmoothingEnabled = false;
        if (this.preData) {
            this.ctx2.putImageData(this.preData, 0, 0);
        } else {
            this.ctx2.drawImage(this.img, 0, 0);
        }
        this.ctx2.drawImage(this.canvas1,
            0,
            0,
            WIDTH1,
            HEIGHT1,
            startX,
            startY,
            sWidth,
            sHeight
        );
        this.preData = this.ctx2.getImageData(0, 0, this.canvas2.width, this.canvas2.height);
    }
    onMouseUp = e => {
        if (!this.start) return;
        this.start = false;
        let {left, top, width, height} = this.refs.aside.style;
        [left, top, width, height] = [left, top, width, height].map(x => x.replace(/px/, ''));
        this.pasteMosaic(
            this.cutImg({left, top, width, height})
        );
        this.refs.aside.style.width = 0;
        this.refs.aside.style.height = 0;
    }
    onMouseLeave = e => {
        // this.onMouseUp(e);
    }
    onOk = () => {
        this.canvas2.toBlob(async blob => {
            try {
                const {data} = await this.getUptoken();
                const body = new FormData();
                body.append('file', blob);
                body.append('key', data.key);
                body.append('token', data.token);
                const res = await fetch(config.QINIU_UPLOAD_PREFIX, {method: 'POST', body}).then(res => res.json());
                this.img.src = `${config.FILESERVER_PREFIX}/${res.key}`;
                this.props.done(this.img.src);
                this.setState({visible: false});
            } catch (error) {
                message.error('保存图片遇到错误');
                this.setState({visible: false});
            }
        });
    }
    getUptoken = async () => {
        return await fetch(`${config.API_PREFIX}/qiniu/uptoken`, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': 'Bearer ' + this.props.token
            }
        }).then(res => res.json());
    }
    render () {
        return (
            <Modal
                width={960}
                visible={this.state.visible}
                onCancel={() => this.setState({visible: false})}
                afterClose={this.props.afterClose}
                onOk={this.onOk}
            >
                <canvas hidden ref='canvas1' />
                <div
                    ref='wrap'
                    className={style.contianer}
                    onMouseDown={this.onMouseDown}
                    onMouseMove={this.onMouseMove}
                    onMouseUp={this.onMouseUp}
                    onMouseLeave={this.onMouseLeave}
                >
                    <aside ref='aside' />
                    <canvas ref='canvas2' />
                </div>
            </Modal>
        );
    }
}

export default MasicImage;
