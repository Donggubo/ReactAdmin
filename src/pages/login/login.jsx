import React, {Component} from 'react';
/*引入图片logo*/
import logo from '../../assets/images/logo.png';
/*引入less样式文件*/
import './login.less';
/*引入Form表单组件*/
import {Form, Icon, Input, Button, message} from 'antd';
/*引入登录接口请求函数--按名称引入使用大括号，因为不是统一默认暴露，而是多次暴露*/
import {reqLogin} from '../../api';// 因为index.js，直接引入到文件夹一层即可
/*导入在内存中保存数据的模块*/
import memoryUtils from '../../utils/memoryUtils';
/*导入将数据保存到本地的模块*/
import storageUtils from '../../utils/storageUtils';
/*导入Redirect标签，因为是多次暴露的所以导入时使用大括号*/
import {Redirect} from 'react-router-dom';

const Item = Form.Item;// 必须在import后面使用
class Login extends Component {
    handleSubmit = e => {
        e.preventDefault();// 阻止默认事件
        // 验证表单
        this.props.form.validateFields(async (err, values) => {// 此处的values是包含表单中所有数据的对象
            // 没有错误的情况
            if (!err) {
                //console.log(values, 'values的值');
                // const {username, password} = values;// 对象结构化，需要和getFieldDecorator指定的唯一标识名一致
                const user = values;
                //发送登录请求
                /*reqLogin(username, password).then(response => {
                    console.log(response.data);
                }).catch(error => {
                    console.log(error);
                });*/
                // 使用await和async简化promise的使用
                // 统一处理异常之前
                /*try{
                    // const response = await reqLogin(username, password);
                    const result = await reqLogin(username, password);
                    console.log('登录成功', result);
                    if(result.status === 0){
                        message.success('登录成功');
                        // 请求成功获取返回的user对象
                        const user = result.data;
                        // 登录成功保存user数据到内存
                        memoryUtils.user =user;
                        // 登录成功保存user数据到本地
                        storageUtils.saveUser(user);
                        // 跳转页面，使用replace，因为登录成功无需再返回
                        this.props.history.replace('/');
                    }else {
                        // 用户名和密码不对
                         message.error(result.msg)
                    }
                } catch(error){
                    console.log('请求失败', error.message);
                }*/
                // console.log('Received values of form: ', values);
                // 统一处理异常之后
                // const result = await reqLogin(username, password);//或者下面一行代码
                const result = await reqLogin(user);// 发送请求获取结果数据
                console.log('登录成功', result);
                if (result.status === 0) {// 判断登录成功
                    message.success('登录成功');
                    // 请求成功获取返回的user对象
                    const user = result.data;
                    // 登录成功保存user数据到内存
                    memoryUtils.user = user;
                    // 登录成功保存user数据到本地
                    storageUtils.saveUser(user);
                    // 跳转页面，使用replace，因为登录成功无需再返回
                    this.props.history.replace('/');
                } else {
                    // 用户名和密码不对
                    message.error(result.msg)
                }
            }
        });
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

    render() {
        // 包装后的组件中获取getFieldDecorator用于校验
        const {getFieldDecorator} = this.props.form;
        //从内存中读取user的值，如果已经登录则跳转到首页面
        const user = memoryUtils.user;
        if (user && user._id) {
            return <Redirect to='/'/>
        }
        return (
            <div className='login'>
                <header className='login-header'>
                    <img src={logo} alt="logo"/>
                    <h1>React 项目: 后台管理系统</h1>
                </header>
                <section className='login-content'>
                    <h3>用户登录</h3>
                    <Form onSubmit={this.handleSubmit} className="login-form">
                        <Item>
                            {
                                getFieldDecorator(
                                    /*username是表单数据的唯一标识*/
                                    'username', {
                                        /*验证规则*/
                                        rules: [
                                            {required: true, whitespace: true, message: '请输入用户名！'},
                                            {min: 4, message: '用户名至少4位！'},
                                            {max: 12, message: '用户名最多12位！'},
                                            {pattern: /^[a-zA-Z0-9_]+$/, message: '用户名必须由数字字母或下划线组成！'}
                                        ],
                                        /*表单输入框初始值*/
                                        initialValue: 'admin'
                                    }
                                )(
                                    <Input
                                        prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                        placeholder="用户名"
                                    />
                                )
                            }
                        </Item>
                        <Item>
                            {
                                getFieldDecorator(
                                    'password', {
                                        rules: [
                                            /*{ required: true, whitespace: true, message: '请输入密码！' },
                                            { min: 4, message: '密码至少4位！' },
                                            { max: 12, message: '密码最多12位！' },
                                            { pattern: /^[a-zA-Z0-9_]+$/, message: '密码必须由数字字母或下划线组成！' }*/
                                            /*使用自定义验证规则*/
                                            {validator: this.validator}
                                        ]
                                    }
                                )(
                                    <Input
                                        prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                        type="password"
                                        placeholder="密码"
                                    />
                                )
                            }
                        </Item>
                        <Item>
                            <Button type="primary" htmlType="submit" className="login-form-button">
                                登录
                            </Button>
                        </Item>
                    </Form>
                </section>
            </div>
        )
    }
}

const WrapLogin = Form.create()(Login);
export default WrapLogin;
