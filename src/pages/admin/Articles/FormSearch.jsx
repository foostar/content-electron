import React, {Component} from 'react';
import {Form, Input, Select} from 'antd';
import CategorySelect from 'components/CategorySelect';
import style from './style.styl';

const FormItem = Form.Item;
const Option = Select.Option;
let timeout;
let currentValue;
export default class FormSearch extends Component {
    state = {
        data: []
    }
    handleChange = (value) => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        currentValue = value;
        timeout = setTimeout(async () => {
            const result = await this.props.searchUser({query: {username: value}});
            if (currentValue == value) {
                const data = result.payload.result.data.map((v) => {
                    return {
                        value: v.id,
                        text: v.username
                    };
                });
                this.setState({data});
            }
        }, 300);
    }
    render () {
        const {recentTag, getFieldDecorator, form} = this.props;
        const options = recentTag.map((v, index) => {
            return <Option key={index} value={v}>{v}</Option>;
        });
        const children = [
            <div key='1'>
                <div className={style['form-item-label']}>作者名</div>
                <FormItem>
                    {getFieldDecorator('author', {
                        initialValue: form.author || ''
                    })(<Select
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
                        initialValue: form.keyword || ''
                    })(<Input />)}
                </FormItem>
            </div>,
            <div key='3'>
                <div className={style['form-item-label']}>分类</div>
                <FormItem>
                    {getFieldDecorator('category', {
                        initialValue: form.category || []
                    })(<CategorySelect />)}
                </FormItem>
            </div>,
            <div key='4'>
                <div className={style['form-item-label']}>包含的标签</div>
                <FormItem>
                    {getFieldDecorator('includeTags', {
                        initialValue: form.includeTags || []
                    })(<Select tags>{options}</Select>)}
                </FormItem>
            </div>,
            <div key='5'>
                <div className={style['form-item-label']}>不包含的标签</div>
                <FormItem>
                    {getFieldDecorator('excludeTags', {
                        initialValue: form.excludeTags || []
                    })(<Select tags>{options}</Select>)}
                </FormItem>
            </div>
        ];
        return <div>{children}</div>;
    }
}
