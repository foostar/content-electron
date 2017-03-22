import 'simditor/styles/simditor.css';
import 'simditor-fullscreen/styles/simditor-fullscreen.css';

import React, {Component} from 'react';
import style from './style.styl';
import {connect} from 'react-redux';
import config from 'config';
import classnames from 'classnames';

import $ from 'jquery';
import Simditor from 'simditor';
import 'simditor-fullscreen';
import Dropzone from './dropzone';
import {Modal} from 'antd';
import defaultImage from 'images/default-image.png';
import errorImage from 'images/error-image.png';
import MosaicImage from 'components/MosaicImage';

Simditor.connect(Dropzone);

const mapStateToProps = (state, props) => {
    return {
        token: state.passport.data.token
    };
};

@connect(mapStateToProps)
class SimpEditor extends Component {
    state = {
        imgRelacing: false,
        mosaicVisible: false,
        mosaicKey: Date.now(),
        mosaicImg: null
    }
    editor = null

    componentWillReceiveProps (nextProps) {
        if (nextProps.children !== this.props.children) {
            this.setValueByChildren(nextProps.children);
        }
    }

    componentDidMount () {
        const textarea = this.refs.textarea;
        this.editor = new Simditor({
            textarea: $(textarea),
            upload: {
                url: 'http://upload.qiniu.com',
                getParams: async (cb) => {
                    const {data} = await this.getUptoken();
                    cb(data);
                },
                formatPath ({key}) {
                    return 'http://distribution-file.apps.xiaoyun.com/' + key;
                },
                fileKey: 'file',
                connectionCount: 3,
                leaveConfirm: '正在上传文件中，如果离开页面将自动取消。'
            },
            placeholder: this.props.placeholder,
            pasteImage: true,
            defaultImage,
            toolbar: ['title', 'bold', 'italic', 'underline', 'strikethrough', 'fontScale', 'color', 'ol', 'ul', 'table', 'link', 'image', 'hr', 'indent', 'outdent', 'alignment', 'fullscreen']
        });
        this.editor.on('pasting', () => {
            this.setState({imgRelacing: true});
            setTimeout(this.handlePaste, 500);
        });
        this.setValueByChildren(this.props.children);
        this.props.getEditor(this.editor);
    }
    setValueByChildren = children => {
        if (typeof children === 'string') {
            this.editor.setValue(children);
        }
    }
    getUptoken = async () => {
        return await fetch(`${config.API_PREFIX}/qiniu/uptoken`, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': 'Bearer ' + this.props.token
            }
        }).then(res => res.json());
    }
    handlePaste = async () => {
        const replaceImgSrc = async (img) => {
            try {
                if (img.src.startsWith('data:image')) {
                    const file = await fetch(img.src).then(res => res.blob());
                    const {data} = await this.getUptoken();
                    const body = new FormData();
                    body.append('file', file);
                    body.append('key', data.key);
                    body.append('token', data.token);
                    const {key} = await fetch('http://upload.qiniu.com', {
                        method: 'POST',
                        body
                    }).then(res => res.json());
                    img.src = 'http://distribution-file.apps.xiaoyun.com/' + key;
                } else {
                    const res = await fetch(`${config.API_PREFIX}/qiniu/replace-src`, {
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8',
                            'Authorization': 'Bearer ' + this.props.token
                        },
                        method: 'POST',
                        body: JSON.stringify({path: img.src})
                    }).then(res => res.json());
                    if (!res.data.key) throw Error('no key in response body');
                    img.src = 'http://distribution-file.apps.xiaoyun.com/' + res.data.key;
                }
            } catch (err) {
                img.src = errorImage;
                throw err;
            }
        };
        const tmpDiv = document.createElement('DIV');
        tmpDiv.innerHTML = this.editor.getValue();
        const imgs = [...tmpDiv.querySelectorAll('img')].filter(img => !img.src.match(/xiaoyun\.com/));
        if (!imgs.length) return this.setState({imgRelacing: false});
        try {
            await Promise.all(imgs.map(replaceImgSrc));
        } catch (err) {
            console.error(err);
            Modal.error({
                title: '部分图片上传出现错误',
                content: (
                    <p>
                        <h3>显示如下的图片则是保存失败的图片, 需要重新粘贴</h3>
                        <img width='80' src={errorImage} />
                    </p>
                )
            });
        }
        this.setState({imgRelacing: false});
        this.editor.setValue(tmpDiv.innerHTML);
    }
    componentWillUnmount () {
        this.editor.destroy();
        this.editor = null;
    }
    onDoubleClick = e => {
        const el = e.target;
        if (el.tagName.toLowerCase() === 'img') {
            this.setState({
                mosaicVisible: true,
                mosaicKey: Date.now(), // 保证触发 cdm
                mosaicImg: el
            });
        }
    }
    afterMosaicClose = () => {
        this.setState({mosaicVisible: false});
    }
    render () {
        const className = classnames(this.props.className, style['wrap'], {
            [style['img-replacing']]: this.state.imgRelacing
        });
        return (
            <div
                className={className}
                style={this.props.style || {}}
                onDoubleClick={this.onDoubleClick}
            >
                {this.state.mosaicVisible &&
                    <MosaicImage
                        key={this.state.key}
                        img={this.state.mosaicImg}
                        afterClose={this.afterMosaicClose} />
                }
                <style scope>{`
                    .simditor-body {
                        height: ${this.props.height || '400px'} !important;
                        overflow: auto;
                    }
                `}</style>
                <textarea ref='textarea' />
            </div>
        );
    }
}

export default SimpEditor;
