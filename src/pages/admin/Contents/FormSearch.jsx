import React, {Component} from 'react';
import {Form, Input, Select} from 'antd';
import CategorySelect from 'components/CategorySelect';
import style from './style.styl';

const FormItem = Form.Item;
const Option = Select.Option;
export default class FormSearch extends Component {
    state = {
        data: []
    }
    timeout = null
    handleChange = (username) => {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.timeout = setTimeout(async () => {
            const result = await this.props.searchUser({query: {username, limit: 20}});
            const data = result.payload.result.data.users.map((v) => {
                return {
                    value: v.id,
                    text: v.username
                };
            });
            this.setState({data});
        }, 1000);
    }
    render () {
        const {recentTag, getFieldDecorator, condition} = this.props;
        const options = recentTag.map((v, index) => {
            return <Option key={index} value={v}>{v}</Option>;
        });
        const children = [
            <div key='1'>
                <div className={style['form-item-label']}>作者</div>
                <FormItem>
                    {getFieldDecorator('author', {
                        initialValue: condition.author || []
                    })(<Select
                        placeholder='作者名字'
                        combobox
                        notFoundContent=''
                        defaultActiveFirstOption={false}
                        showArrow={false}
                        filterOption={false}
                        optionLabelProp='value'
                        onChange={this.handleChange}
                    >
                        {this.state.data.map((d, i) => {
                            return <Option key={i} value={d.text}> {d.text} </Option>;
                        })}
                    </Select>)}
                </FormItem>
            </div>,
            <div key='2'>
                <div className={style['form-item-label']}>正文关键字</div>
                <FormItem>
                    {getFieldDecorator('keyword', {
                        initialValue: condition.keyword || ''
                    })(<Input placeholder='正文内容' />)}
                </FormItem>
            </div>,
            <div key='3'>
                <div className={style['form-item-label']}>分类</div>
                <FormItem>
                    {getFieldDecorator('category', {
                        initialValue: condition.category || ['']
                    })(<CategorySelect all />)}
                </FormItem>
            </div>,
            <div key='4'>
                <div className={style['form-item-label']}>包含的标签</div>
                <FormItem>
                    {getFieldDecorator('includeTags', {
                        initialValue: condition.includeTags || []
                    })(<Select placeholder='选择标签' tags>{options}</Select>)}
                </FormItem>
            </div>,
            <div key='5'>
                <div className={style['form-item-label']}>不包含的标签</div>
                <FormItem>
                    {getFieldDecorator('excludeTags', {
                        initialValue: condition.excludeTags || []
                    })(<Select placeholder='选择标签' tags>{options}</Select>)}
                </FormItem>
            </div>
        ];
        return <div>{children}</div>;
    }
}
