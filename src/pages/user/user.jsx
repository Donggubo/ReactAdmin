import React, {Component} from "react";
import {Card, Button, Table, Modal, message} from "antd";
import {PAGE_SIZE} from "../../utils/constants";
import {formatDate} from "../../utils/dateformatUtils";
import LinkButton from '../../components/link-button';
import {reqAddOrUpdateUser, reqDeleteUser, reqUsers} from "../../api";
import UserForm from './user-form';
const confirm = Modal.confirm;
export default class User extends Component {
    state = {
        users: [], // 所有用户
        roles: [], // 所有角色
        isShow: false, // 是否显示对话框
        loading: false // 加载效果默认不显示
    };
    // 初始化表格的标题
    initColumns = () => {
        this.columns = [
            {
                title: '用户名',
                dataIndex: 'username'
            },
            {
                title: '邮箱',
                dataIndex: 'email'
            },
            {
                title: '电话',
                dataIndex: 'phone'
            },
            {
                title: '注册时间',
                dataIndex: 'create_time',
                render: formatDate
            },
            {
                title: '所属角色',
                dataIndex: 'role_id',
                // render: (role_id) => this.state.roles.find((role) => role._id === role_id).name
                render: (role_id) => this.roleNames[role_id]
            },
            {
                title: '操作',
                render: (user) => (
                    <span>
                        <LinkButton onClick={() => this.showUpdateUser(user)}>修改</LinkButton>
                        <LinkButton onClick={() => this.deleteUser(user)}>删除</LinkButton>
                    </span>
                )
            },
        ];
    };
    // 获取所有用户列表
    getUsers = async () => {
        // 请求数据前进行显示加载
        this.setState({loading: true});
        const result = await reqUsers();
        // 请求数据后加载效果消失
        this.setState({loading: false});
        if(result.status === 0){
            const {users, roles} = result.data;
            this.initRoleNames(roles);// 不能放在setState后面操作，否则render: (role_id) => this.roleNames[role_id]报错，因为render比componentDidMount先执行
            this.setState({users, roles});
        }else{
            message.error("获取用户列表异常");
        }
    };
    // 组织出角色id和名字对应的对象的方法，数据格式{role_id: roleName}
    initRoleNames = (roles) => {
       const roleNames = roles.reduce((pre, role) => {
            pre[role._id] = role.name;
            return pre;
        }, {});
       this.roleNames = roleNames;
    };
    // 添加或者更新用户
    addOrUpdateUser = () => {
        // 验证表单，form对象通过this获取而非this.props，该form是从user-form中获取到的
        this.form.validateFields(async (err, values) => {
            if (!err) {
                // a.设置状态关闭对话框
                this.setState({
                    isShow: false
                });
                // b.发送请求完成更新
                const user = values;// 使用表单验证后直接values就是添加用户时所需要的对象数据
                // 判断this.user的_id，如果存在说明是更新，将其赋值到user中的_id
                if(this.user && this.user._id){
                    user._id = this.user._id;
                }
                const result = await reqAddOrUpdateUser(user);// 调用reqAddUser传递参数并获取结果数据
                if(result.status === 0){// 判断添加成功
                    message.success(`${this.user._id ? '修改': '添加'}用户成功`);// 使用this.user._id而非user._id，提示未定义，因为下面的const user = result.data;
                    this.form.resetFields();// 添加成功后清空缓存，避免点击修改下一个时出现原来的值
                    // 请求用户列表
                    this.getUsers();
                    /*// 无需再次发送请求更新角色列表
                    const user = result.data;// 获取后台返回的data即role对象
                    // 在原本的数据的基础上追加新的数据而不是再次发送请求，在setState中使用函数的方式
                    this.setState(state => ({
                        users: [...this.state.users]
                    }));*/
                }else{
                    message.error(`${user._id ? '修改': '添加'}用户失败`)
                }
            }
        });
    };
    // 删除用户
    deleteUser = (user) => {
        confirm(
            {
                title: `确定要删除${user.username}吗？`,
                onOk: async () => {
                    const result = await reqDeleteUser(user._id);
                    if(result.status === 0){
                        message.success(`删除${user.username}成功！`);
                        this.getUsers();
                    }
                },
                onCancel() {
                    console.log('Cancel');
                },
            }
        );
    };
    // 显示添加用户的界面
    showAddUser = () => {
        this.user = null;// 将this.user置为null，避免显示更新后的值
        this.setState({isShow: true});
    };
    // 显示修改用户的界面
    showUpdateUser = (user) => {
        this.user = user;// 将user信息保存到当前组件this上面
        this.setState({
            isShow:true
        })
    };
    // componentWillMount为第一次render作数据准备
    componentWillMount() {
        this.initColumns();
    }
    // 发送异步请求
    componentDidMount() {
        this.getUsers();
    }
    render() {
        const {users, roles, isShow} = this.state;
        const user = this.user || {};// 取出当前组件this中的user
        const title = (<Button type='primary' onClick={this.showAddUser}>创建用户</Button>);
        return (
            <Card title={title}>
                <Table
                    dataSource={users}
                    columns={this.columns}
                    bordered/*带边框*/
                    rowKey='_id'/*指定唯一id*/
                    pagination={{defaultPageSize:PAGE_SIZE}}/*配置分页*/
                    /*loading={loading}加载效果*/
                />
                <Modal
                    title={user._id ? "修改用户": "添加用户"}
                    visible={isShow}
                    onOk={this.addOrUpdateUser}
                    onCancel={() =>
                    {
                        this.form.resetFields();// 点击取消重置输入框
                        this.setState({isShow: false})}
                    }
                    okText="确认"
                    cancelText="取消"
                >
                    <UserForm setForm={form => this.form = form} roles={roles} user={user}/>
                </Modal>
            </Card>
        )
    }
}