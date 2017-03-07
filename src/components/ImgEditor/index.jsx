import React from 'react';
import {Row, Col, Select, Modal} from 'antd';
import style from './style.styl';
const Option = Select.Option;
export default class ImgEidtor extends React.Component {
    state = {
        SIZE: 10,
        TYPE: 'square',
        uploading: false
    }
    componentDidMount () {
        this.originImg = document.createElement('IMG');
        this.originImg.onload = (e) => {
            this.ctx = this.refs.canvas.getContext('2d');
            const {naturalWidth, naturalHeight} = this.originImg;
            this.RATIO = (window.devicePixelRatio || 1) /
        (this.refs.canvas.backingStorePixelRatio || 1);
            this.WIDTH = naturalWidth * this.RATIO;
            this.HEIGHT = naturalHeight * this.RATIO;
            this.RATE = this.WIDTH / this.refs.canvas.offsetWidth;
            this.refs.canvas.width = this.WIDTH;
            this.refs.canvas.height = this.HEIGHT;
            this.ctx.drawImage(this.originImg, 0, 0, this.WIDTH, this.HEIGHT);
            this.refs.canvas.toBlob((blob) => {
                this.originBlob = blob;
            });
        };
        this.originImg.src = this.props.src;
    }
    onMouseDown = (e) => {
        e.preventDefault();
        const {clientX, clientY} = e;
        this.active = true;
        this.x0 = this.refs.canvas.getBoundingClientRect().left;
        this.y0 = this.refs.canvas.getBoundingClientRect().top;
        this.x1 = clientX;
        this.y1 = clientY;
        this.preData = this.ctx.getImageData(0, 0, this.WIDTH, this.HEIGHT);
    }
    onMouseMove = (e) => {
        if (!this.active) return;
        this.x2 = e.clientX;
        this.y2 = e.clientY;
        this.ctx.putImageData(this.preData, 0, 0);
        this.ctx.strokeStyle = '#333';
        this.ctx.fillStyle = 'rgba(0,0,0,.5)';
        this._x1 = (this.x1 - this.x0) * this.RATE;
        this._y1 = (this.y1 - this.y0) * this.RATE;
        this._x2 = (this.x2 - this.x1) * this.RATE;
        this._y2 = (this.y2 - this.y1) * this.RATE;
        this.ctx.fillRect(
      this._x1,
      this._y1,
      this._x2,
      this._y2
    );
        this.ctx.strokeRect(
      this._x1,
      this._y1,
      this._x2,
      this._y2
    );
    }
    onMouseUp = (e) => {
        const {SIZE, TYPE} = this.state;
        if (!this.active) return;
        this.active = false;
        this.ctx.putImageData(this.preData, 0, 0);
        for (let i = 0; i * SIZE < this._x2; i++) {
            for (let k = 0; k * SIZE < this._y2; k++) {
                const x = ~~(this._x1 + i * SIZE);
                const y = ~~(this._y1 + k * SIZE);
                const imageData = this.ctx.getImageData(x, y, SIZE, SIZE);
                const pixelArray = imageData.data;
                const m = (~~(SIZE * SIZE / 8)) * 4;
                const r = pixelArray[m];
                const g = pixelArray[m + 1];
                const b = pixelArray[m + 2];
                const a = pixelArray[m + 3] / 255;
                this.ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
                if (TYPE === 'cicle') {
                    this.ctx.beginPath();
                    this.ctx.arc(x + SIZE / 2, y + SIZE / 2, SIZE / 2, 0, Math.PI * 2, false);
                    this.ctx.closePath();
                    this.ctx.fill();
                } else {
                    this.ctx.fillRect(x, y, SIZE, SIZE);
                }
            }
        }
        this.preData = this.ctx.getImageData(0, 0, this.WIDTH, this.HEIGHT);
    }
    onMouseLeave = (e) => {
        this.onMouseUp(e);
    }
    handleSave = () => {
        this.setState({uploading: true});
        this.refs.canvas.toBlob((blob) => {
            this.props.imageProcess(this.props.src, blob);
        });
        // this.refs.canvas.toBlob(async(blob) => {
        //     const key = `${Date.now()}_(${this._x1}_${this._y1})*(${this._x1 + this._x2}_${this._y1 + this._y2})`;
        //     await uploadFile(this.originBlob, 'origin_' + key);
        //     const src = await uploadFile(blob, key);
        //     this.props.replaceImg(this.props.src, src);
        //     this.setState({uploading: false});
        //     this.props.toggle();
        // });
    }
    render () {
        return (
            <Modal width={800} title='图像处理' visible={this.props.modalVisible}
                onOk={this.handleSave}
                onCancel={this.props.modalCancel}
                confirmLoading={this.props.isFetching}
                                >
                {this.state.uploading &&
                <div>
                    <div className='sk-fading-circle'>
                        <div className='sk-circle1 sk-circle' />
                        <div className='sk-circle2 sk-circle' />
                        <div className='sk-circle3 sk-circle' />
                        <div className='sk-circle4 sk-circle' />
                        <div className='sk-circle5 sk-circle' />
                        <div className='sk-circle6 sk-circle' />
                        <div className='sk-circle7 sk-circle' />
                        <div className='sk-circle8 sk-circle' />
                        <div className='sk-circle9 sk-circle' />
                        <div className='sk-circle10 sk-circle' />
                        <div className='sk-circle11 sk-circle' />
                        <div className='sk-circle12 sk-circle' />
                    </div>
                </div>
        }
                <Row>
                    <Col xs={8} className={style.inputWrap}>
                        <label>模糊程度：</label>
                        <input
                            type='number'
                            step='5'
                            min='5'
                            max='30'
                            value={this.state.SIZE}
                            onChange={(e) => this.setState({SIZE: e.target.value})}
                            className={style.formControl} />
                    </Col>
                    <Col xs={8}>
                        <label>模糊方式：</label>
                        <Select defaultValue='square' className={style.formControl} onChange={(value) => this.setState({TYPE: value})}>
                            <Option value='square'>正方形</Option>
                            <Option value='cicle'>圆形</Option>
                        </Select>
                    </Col>
                </Row>
                <hr />
                <div>
                    <canvas ref='canvas'
                        onMouseDown={this.onMouseDown}
                        onMouseMove={this.onMouseMove}
                        onMouseUp={this.onMouseUp}
                        onMouseLeave={this.onMouseLeave}
                        className={style.canvas}
                         />
                </div>
            </Modal>
        );
    }
}
