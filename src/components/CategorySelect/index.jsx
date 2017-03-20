import React, {Component} from 'react';
import {Select} from 'antd';
const {OptGroup, Option} = Select;

class CategorySelect extends Component {
    render () {
        const categories = [
            {
                value: '常用',
                label: '常用',
                children: [
                    {value: '搞笑', label: '搞笑'},
                    {value: '美图', label: '美图'},
                    {value: '科学', label: '科学'},
                    {value: '历史', label: '历史'}
                ]
            },
            {
                value: '两性健康',
                label: '两性健康',
                children: [
                    {value: '两性', label: '两性'},
                    {value: '情感', label: '情感'},
                    {value: '女人', label: '女人'},
                    {value: '健康', label: '健康'}
                ]
            },
            {
                value: '国际社会',
                label: '国际社会',
                children: [
                    {value: '社会', label: '社会'},
                    {value: '三农', label: '三农'},
                    {value: '军事', label: '军事'},
                    {value: '游戏', label: '游戏'},
                    {value: '娱乐', label: '娱乐'},
                    {value: '体育', label: '体育'}
                ]
            },
            {
                value: '生活服务',
                label: '生活服务',
                children: [
                    {value: '宠物', label: '宠物'},
                    {value: '家居', label: '家居'},
                    {value: '时尚', label: '时尚'},
                    {value: '育儿', label: '育儿'},
                    {value: '美食', label: '美食'},
                    {value: '旅游', label: '旅游'},
                    {value: '汽车', label: '汽车'},
                    {value: '生活', label: '生活'}
                ]
            }
        ];
        this.props.all && categories.unshift({value: '', label: '全部'});
        return (
            <Select {...this.props} placeholder='请选择分类'>
                {categories.map((item, idx) => {
                    if (item.children && item.children.length > 0) {
                        return (
                            <OptGroup key={item.label}>
                                {
                                    item.children.map((_item, _idx) =>
                                        <Option value={_item.value} key={`${idx}-${_idx}`}>
                                            {_item.label}
                                        </Option>
                                    )
                                }
                            </OptGroup>
                        );
                    } else {
                        return <Option key='all' value={item.value}>{item.label}</Option>;
                    }
                })
                }
            </Select>
        );
    }
}

export default CategorySelect;
