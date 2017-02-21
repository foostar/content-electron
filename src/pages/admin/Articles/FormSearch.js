import React, {Component} from 'react';
import {Form, Input, Select, Row, Col} from 'antd';
import style from './style.styl';

const FormItem = Form.Item;
const Option = Select.Option;
export default class FormSearch extends Component {
    render () {
        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16}
        };
        const {recentTag, getFieldDecorator, form, expand} = this.props;
        const options = recentTag.map((v, index) => {
            return <Option key={index} value={v}>{v}</Option>;
        });
        const children = [<Col span={8} key='1'>
            <FormItem
                {...formItemLayout}
                label='作者id'
            >
                {getFieldDecorator('author', {
                    rules: [],
                    initialValue: form.author || ''
                })(
                    <Input placeholder='作者id' />
                          )}
            </FormItem>
        </Col>, <Col span={8} key='2'>
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
        </Col>, <Col span={8} key='3'>
            <FormItem
                {...formItemLayout}
                label='正文关键字'
            >
                {getFieldDecorator('keyword', {
                    rules: [],
                    initialValue: form.keyword || ''
                })(
                    <Input placeholder='正文关键字' />
                          )}
            </FormItem>
        </Col>, <Col span={8} key='4'>
            <FormItem
                {...formItemLayout}
                label='包含的标签'
            >
                {getFieldDecorator('includeTags', {
                    rules: [],
                    initialValue: form.includeTags || []
                })(
                    <Select tags placeholder='选择包含的标签'>
                        {options}
                    </Select>
                                )}
            </FormItem>
        </Col>, <Col span={8} key='5'>
            <FormItem
                {...formItemLayout}
                label='不包含的标签'
            >
                {getFieldDecorator('excludeTags', {
                    rules: [],
                    initialValue: form.excludeTags || []
                })(
                    <Select tags placeholder='选择不包含的标签'>
                        {options}
                    </Select>
                                )}
            </FormItem>
        </Col>];
        const shownCount = expand ? children.length : 3;
        return (
            <Row gutter={40}>
                {children.slice(0, shownCount)}
            </Row>
        );
    }
}
