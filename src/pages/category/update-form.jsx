import React, {Component} from "react";
import PropTypes from 'prop-types';
import {Form, Input} from "antd";
const Item = Form.Item;
class UpdateForm extends Component {
    // 用于接收从category组件<UpdateForm categoryName={category.name} setForm={(form) => {this.form = form}}/>
    // 中传递的属性，接收后保存到props中
    static propTypes = {
        categoryName: PropTypes.string.isRequired,
        setForm: PropTypes.func.isRequired
    };
    // 通过钩子函数传递form对象给父组件
    componentWillMount() {
        this.props.setForm(this.props.form);// 通过props调用父组件传递的setForm方法将子组件的form对象传递给父组件
    }

    render() {
        const { getFieldDecorator } = this.props.form;// 使用高阶组件包装后获取form对象的getFieldDecorator
        const {categoryName} = this.props;// 从props中获取传递的属性
        return (
            <Form>
                <Item>
                    {getFieldDecorator(
                        'categoryName',
                        {
                            /*配置验证规则*/
                            rules: [
                                {required: true, whitespace: true, message: '请输入分类名称'},
                                {min: 2, message: '分类名称最少2位！'},
                                {max: 8, message: '分类名称最多8位！'}
                            ],
                            initialValue: categoryName/*将传递过来的categoryName作为初始值用于点击修改分类时显示*/
                        }
                    )(
                        <Input placeholder='请输入分类名称'/>
                    )}
                </Item>
            </Form>
        )
    }
}
export default Form.create()(UpdateForm);// 高阶组件包装后有form对象