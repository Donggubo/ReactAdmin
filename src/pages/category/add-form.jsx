import React, {Component} from "react";
import {Form, Select, Input} from "antd";
import PropTypes from 'prop-types';
const Item = Form.Item;
const Option = Select.Option;
/*用于添加分类的表单*/
class AddForm extends Component {
    // 接收父组件传递的属性
    static propTypes = {
        category: PropTypes.array.isRequired,// 一级分类的数组
        setForm: PropTypes.func.isRequired,
        parentId: PropTypes.string.isRequired// 表示当前要添加分类的parentId
    };
    // 在钩子函数中调用父组件传递的setForm方法，将子组件的form对象传递给父组件
    componentWillMount() {
        this.props.setForm(this.props.form);
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const {category, parentId} = this.props;
        return (
            <Form>
                <p>
                    所属分类：
                </p>
                <Item>
                    {getFieldDecorator(
                        'parentId',
                        {
                            initialValue: parentId
                        }
                    )(
                        <Select>
                            <Option value='0'>一级分类列表</Option>
                            {
                                category.map(c => <Option value={c._id} key={c._id}>{c.name}</Option> )
                            }
                        </Select>
                    )}
                </Item>
                <p>
                    分类名称：
                </p>
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
                            initialValue: ''
                        }
                    )(
                        <Input placeholder='请输入分类的名称'/>
                    )}
                </Item>
            </Form>
        )
    }
}
export default Form.create()(AddForm);