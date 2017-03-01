import React, {Component} from 'react';
import {Form, Input, Select} from 'antd';
import style from './style.styl';

const FormItem = Form.Item;
const Option = Select.Option;
export default class FormSearch extends Component {
    render () {
        const formItemLayout = {
            labelCol: {span: 0},
            wrapperCol: {span: 24}
        };

        const {recentTag, getFieldDecorator, form, expand} = this.props;
        const options = recentTag.map((v, index) => {
            return <Option key={index} value={v}>{v}</Option>;
        });

        const children = [
            <div key='1'>
                <div className={style['form-item-label']}>作者ID</div>
                <FormItem
                    {...formItemLayout}
                    label='作者ID'
                >
                    {getFieldDecorator('author', {
                        rules: [],
                        initialValue: form.author || ''
                    })(
                        <Input />
                            )}
                </FormItem>
            </div>,
            <div key='2'>
                <div className={style['form-item-label']}>正文关键字</div>
                <FormItem
                    {...formItemLayout}
                    label='正文关键字'
                >
                    {getFieldDecorator('keyword', {
                        rules: [],
                        initialValue: form.keyword || ''
                    })(
                        <Input />
                    )}
                </FormItem>
            </div>,
            <div key='3'>
                <div className={style['form-item-label']}>分类</div>
                <FormItem
                    {...formItemLayout}
                    label='选择分类'
                >
                    {getFieldDecorator('category', {
                        rules: [],
                        initialValue: form.category || ''
                    })(
                        <Select className={style.select}>
                            <Option value=''>全部</Option>
                            <Option value='other'>其他</Option>
                        </Select>
                    )}
                </FormItem>
            </div>,
            <div key='4'>
                <div className={style['form-item-label']}>包含的标签</div>
                <FormItem
                    {...formItemLayout}
                    label='包含的标签'
                >
                    {getFieldDecorator('includeTags', {
                        rules: [],
                        initialValue: form.includeTags || []
                    })(
                        <Select tags>
                            {options}
                        </Select>
                    )}
                </FormItem>
            </div>,
            <div key='5'>
                <div className={style['form-item-label']}>不包含的标签</div>
                <FormItem
                    {...formItemLayout}
                    label='不包含的标签'
                >
                    {getFieldDecorator('excludeTags', {
                        rules: [],
                        initialValue: form.excludeTags || []
                    })(
                        <Select tags>
                            {options}
                        </Select>
                )}
                </FormItem>
            </div>
        ];

        const shownCount = expand ? children.length : 3;
        return (
            <div>
                {children.slice(0, shownCount)}
            </div>
        );
    }
}
