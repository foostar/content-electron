import React, {Component} from 'react';
import {Select} from 'antd';
const {OptGroup, Option} = Select;

class CategorySelect extends Component {
    render () {
        return (
            <Select {...this.props} placeholder='请选择分类'>
                <OptGroup label='搞笑'>
                    <Option value='搞笑'>搞笑</Option>
                    <Option value='美图'>美图</Option>
                    <Option value='科学'>科学</Option>
                    <Option value='历史'>历史</Option>
                </OptGroup>
                <OptGroup label='科技互联网'>
                    <Option value='互联网'>互联网</Option>
                    <Option value='科技'>科技</Option>
                </OptGroup>
                <OptGroup label='两性健康'>
                    <Option value='两性'>两性</Option>
                    <Option value='情感'>情感</Option>
                    <Option value='女人'>女人</Option>
                    <Option value='健康'>健康</Option>
                </OptGroup>
                <OptGroup label='国际社会'>
                    <Option value='社会'>社会</Option>
                    <Option value='三农'>三农</Option>
                    <Option value='军事'>军事</Option>
                    <Option value='游戏'>游戏</Option>
                    <Option value='娱乐'>娱乐</Option>
                    <Option value='体育'>体育</Option>
                </OptGroup>
                <OptGroup label='生活服务'>
                    <Option value='宠物'>宠物</Option>
                    <Option value='家居'>家居</Option>
                    <Option value='时尚'>时尚</Option>
                    <Option value='育儿'>育儿</Option>
                    <Option value='美食'>美食</Option>
                    <Option value='旅游'>旅游</Option>
                    <Option value='汽车'>汽车</Option>
                    <Option value='生活'>生活</Option>
                </OptGroup>
            </Select>
        );
    }
}

export default CategorySelect;
