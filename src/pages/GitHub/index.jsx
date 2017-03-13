import React, {Component} from 'react';
import {findDOMNode} from 'react-dom';
import Page from 'components/Page';
import $ from 'jquery';
import Simditor from 'simditor';
import 'simditor/styles/simditor.css';
import {Layout} from 'antd';
import style from './style.styl';

const {Footer, Content} = Layout;

class SimpEditor extends Component {
    constructor (props, context) {
        super(props, context);
        this.editor = null;
        this.state = {
            className: `simpeditor ${this.props.className}`,
            opts: this.props.opts
        };
    }
    componentDidMount () {
        const textarea = findDOMNode(this.refs.textarea);
        this.editor = new Simditor({
            textarea: $(textarea),
            upload: {
                url: 'http://upload.qiniu.com',
                getParams: async (cb) => {
                    const params = await fetch('http://baijia.rss.apps.xiaoyun.com/api/qiniu/uptoken').then(res => res.json());
                    cb(params);
                },
                formatPath ({key}) {
                    return 'http://distribution-file.apps.xiaoyun.com/' + key;
                },
                fileKey: 'file',
                connectionCount: 3,
                leaveConfirm: '正在上传文件中，如果离开页面将自动取消。'
            },
            pasteImage: true,
            toolbar: ['title', 'bold', 'italic', 'underline', 'strikethrough', 'fontScale', 'color', 'ol', 'ul', 'table', 'link', 'image', 'hr', 'indent', 'outdent', 'alignment']
        });

        if (typeof this.props.children === 'string' && this.props.children) {
            this.setValue(this.props.children);
        }
    }
    componentWillUnmount () {
        this.editor = null;
    }
    getValue () {
        return this.editor.getValue();
    }
    setValue (content) {
        this.editor.setValue(content);
    }
    sync () {
        return this.editor.sync();
    }
    focus () {
        return this.editor.focus();
    }
    blur () {
        return this.editor.blur();
    }
    hidePopover () {
        return this.editor.hidePopover();
    }
    destroy () {
        this.editor.destroy();
    }
    render () {
        return (
            <Page>
                <Layout style={{height: '100%'}}>
                    <Content className={style.content}>
                        <div className={style.inner}>
                            <textarea ref='textarea' />
                        </div>
                    </Content>
                    <Footer>
                        Footer
                    </Footer>
                </Layout>
            </Page>
        );
    }
}

export default SimpEditor;
