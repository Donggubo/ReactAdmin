import React, {Component} from "react";
import {Form, Input} from "antd";
import PropTypes from 'prop-types';
const Item = Form.Item;
/*用于添加角色的表单*/
class AddForm extends Component {
    // 接收父组件传递的属性
    static propTypes = {
        setForm: PropTypes.func.isRequired,
    };
    // 在钩子函数中调用父组件传递的setForm方法，将子组件的form对象传递给父组件
    componentWillMount() {
        this.props.setForm(this.props.form);
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        // Item的布局
        const formItemLayout = {
            labelCol: { span: 4 },// label左侧的宽度
            wrapperCol: { span: 20 },// 右侧包裹input的宽度
        };
        return (
            <Form {...formItemLayout}>
                <Item label='角色名称'>
                    {getFieldDecorator(
                        'roleName',
                        {
                            /*配置验证规则*/
                            rules: [
                                {required: true, whitespace: true, message: '请输入角色名称'},
                                {min: 2, message: '角色名称最少2位！'},
                                {max: 8, message: '角色名称最多8位！'}
                            ],
                            initialValue: ''
                        }
                    )(
                        <Input placeholder='请输入角色的名称'/>
                    )}
                </Item>
            </Form>
        )
    }
}
export default Form.create()(AddForm);