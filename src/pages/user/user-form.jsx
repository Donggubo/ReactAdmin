import React, {Component} from "react";
import {Form, Select, Input} from "antd";
import PropTypes from "prop-types";

const {Option} = Select;
const {Item} = Form;

class UserForm extends Component {
    // 接收父组件传递的属性
    static propTypes = {
        setForm: PropTypes.func.isRequired,
        roles: PropTypes.array.isRequired,
        user: PropTypes.object
    };
    /*自定义验证规则*/
    validator = (rule, value, callback) => {
        // console.log('validator()', rule, value);
        if (!value) {
            callback('请输入密码！');
        } else if (value.length < 4) {
            callback('密码至少4位！');
        } else if (value.length > 12) {
            callback('密码最多12位！');
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            callback('用户名必须由数字字母或下划线组成！');
        } else {
            callback();
        }
    };
    // 在钩子函数中调用父组件传递的setForm方法，将子组件的form对象传递给父组件
    componentWillMount() {
        this.props.setForm(this.props.form);
    }
    render() {
        const {getFieldDecorator} = this.props.form;
        const {roles, user} = this.props;
        // Item的布局
        const formItemLayout = {
            labelCol: { span: 4 },// label左侧的宽度
            wrapperCol: { span: 20 },// 右侧包裹input的宽度
        };
        return (
            <Form {...formItemLayout}>
                <Item label="用户名">
                    {getFieldDecorator(
                        'username',
                        {
                            /*配置验证规则*/
                            rules: [
                                {required: true, whitespace: true, message: '请输入用户名'},
                                {min: 2, message: '用户名称最少2位！'},
                                {max: 8, message: '用户名称最多8位！'},
                                {pattern: /^[a-zA-Z0-9_]+$/, message: '用户名必须由数字字母或下划线组成！'}
                            ],
                            initialValue: user.username
                        }
                    )(<Input placeholder='请输入用户名'/>)}
                </Item>
                {user._id ? null: (<Item label="密码">
                    {getFieldDecorator(
                        'password',
                        {
                            /*配置验证规则*/
                            rules: [
                                /*{required: true, whitespace: true, message: '请输入密码'},
                                {min: 2, message: '密码最少2位！'},
                                {max: 8, message: '密码最多8位！'}*/
                                {validator: this.validator}
                            ],
                            initialValue: ''
                        }
                    )(<Input type='password' placeholder='请输入密码'/>)}
                </Item>)}{/*如果user的_id存在则不显示密码选项，而不是判断user，因为const user = this.user || {};所以user一直存在，此处需要判断user的_id*/}
                <Item label="手机号">
                    {getFieldDecorator(
                        'phone',
                        {
                            /*配置验证规则*/
                            rules: [
                                {required: true, whitespace: true, message: '请输入手机号'},
                                {pattern:/^1[3|4|5|8][0-9]\d{4,8}$/, message: '不是完整的11位手机号或者正确的手机号前七位!'}
                            ],
                            initialValue: user.phone
                        }
                    )(<Input placeholder='请输入手机号'/>)}
                </Item>
                <Item label="邮箱">
                    {getFieldDecorator(
                        'email',
                        {
                            /*配置验证规则*/
                            rules: [
                                {required: true, whitespace: true, message: '请输入邮箱'},
                                {pattern:/^([a-zA-Z0-9._-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/, message: '请输入正确的邮箱!'}
                            ],
                            initialValue: user.email
                        }
                    )(<Input placeholder='请输入邮箱'/>)}
                </Item>
                <Item label="角色">
                    {getFieldDecorator(
                        'role_id',
                        {
                            rules: [
                                {required: true, whitespace: true, message: '请选择角色'}
                            ],
                            initialValue: user.role_id
                        }
                    )(
                        <Select placeholder="请选择角色">
                            {roles.map(role => (
                                <Option value={role._id} key={role._id}>{role.name}</Option>
                            ))}
                        </Select>,
                    )}
                </Item>
            </Form>
        )
    }
}

export default Form.create()(UserForm);