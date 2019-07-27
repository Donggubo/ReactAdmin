import React, {Component} from "react";
import {Card, Button, Table, Modal, message} from "antd";
import {PAGE_SIZE} from "../../utils/constants";
import {reqRoles, reqAddRole, reqUpdateRole} from "../../api";
import AddForm from './add-form';
import AuthForm from './auth-form';
import {formatDate} from "../../utils/dateformatUtils";
import memoryUtils from "../../utils/memoryUtils";
import storageUtils from "../../utils/storageUtils";

export default class Role extends Component {
    state = {
        roles: [],// 所有角色
        role: {}, // 单个角色
        isShowAdd: false, // 创建角色对话框
        isShowAuth: false // 设置权限对话框
    };
    constructor(props){
        super(props);
        this.auth = React.createRef();// 创建标签容器并传递给子组件
    }
    // 显示的标题
    initColumns = () => {
        this.columns = [
            {
                title: '角色名称',
                dataIndex: 'name',
            },
            {
                title: '创建时间',
                dataIndex: 'create_time',
                render: (create_time) => formatDate(create_time)/*方式一格式化时间*/
            },
            {
                title: '授权时间',
                dataIndex: 'auth_time',
                render: formatDate/*方式二格式化时间*/
            },
            {
                title: '授权人',
                dataIndex: 'auth_name',
            },
        ];
    };
    onRow = (role) => {
        return {
            onClick: event => {
                this.setState({role})
            }, // 点击行
        };
    };
    getRoles = async () => {
        const result = await reqRoles();
        if(result.status ===0){
            const roles = result.data;
            this.setState({roles})
        }
    };
    // 添加角色
    addRole = () => {
        // 验证表单，form对象通过this获取而非this.props，该form是从add-form中获取到的
        this.form.validateFields(async (err, values) => {
            if (!err) {
                // a.设置状态关闭对话框
                this.setState({
                    isShowAdd: false
                });
                // b.发送请求完成更新
                // const {roleName} = this.form.getFieldsValue();// 通过从子组件获取的form对象，调用该对象的getFieldsValue方法，结构出所需数据，该数据是从add-form组件的唯一标识中获取的
                const {roleName} = values;// 使用表单验证后直接从values中结构出所需数据
                const result = await reqAddRole(roleName);//调用reqAddRole传递参数并获取结果数据
                if(result.status === 0){// 判断添加成功
                    message.success('添加角色成功');
                    this.form.resetFields();//添加成功后清空缓存，避免点击修改下一个时出现原来的值
                    // 无需再次发送请求更新角色列表
                    const role = result.data;// 获取后台返回的data即role对象
                    // 在原本的数据的基础上追加新的数据，在setState中使用函数的方式
                    this.setState(state => ({
                       roles: [...this.state.roles, role]
                    }));
                }else{
                    message.error('添加角色失败')
                }
            }
        });
    };
    // 更新角色
    updateRole = async () => {
        // 关闭对话框
        this.setState({
            isShowAuth: false
        });
        // state中的role
        const role = this.state.role;
        // 需要获取子组件的数据即最新的menus，用于更新role
        const menus = this.auth.current.getMenus();// 获取传递的checkedKeys
        role.menus = menus; // 赋值给state中的role的menus
        //授权人
        role.auth_name = memoryUtils.user.username;// 该处的user是登录成功后保存的返回的数据
        // 授权时间
        role.auth_time = Date.now();
        const result = await reqUpdateRole(role);
        if(result.status === 0){
            // 如果更新当前登录用户的角色则强制退出
            if(role._id === memoryUtils.user.role_id){
                message.info("更新权限成功需要重新登录！");
                memoryUtils.user = {};
                storageUtils.removeUser();
                this.props.history.replace('/login');
            }else{
                message.success("更新角色成功");
                this.setState({
                    roles: [...this.state.roles]// 展开运算符生成新的数组进行更新而不是修改原来的数据
                })
            }
        }else{
            message.error("更新角色失败");
        }
    };
    componentWillMount() {
        this.initColumns();
    }
    componentDidMount() {
        this.getRoles();
    }

    render() {
        const {roles, role} = this.state;
        const title = (
            <span>
                <Button type='primary' onClick={() => {this.setState({isShowAdd: true})}}>创建角色</Button>
                <Button type='primary' disabled={!role._id} style={{left:15}} onClick={() => {this.setState({isShowAuth: true})}}>设置角色权限</Button>{/*disabled设置为true时表示禁用，初始值role._id为空，所以!role._id为true，表示没有选择角色时禁用该按钮*/}
            </span>
        );
        return (
            <Card title={title}>
                <Table
                    dataSource={roles}
                    columns={this.columns}
                    rowKey='_id'
                    bordered
                    pagination={{defaultPageSize:PAGE_SIZE}}/*使用前台分页*/
                    rowSelection={{
                        type: 'radio',
                        selectedRowKeys: [role._id],
                        onSelect: (role) => {
                            this.setState({role})
                        }
                    }}
                    onRow={this.onRow}
                />
                <Modal
                    title="创建角色"
                    visible={this.state.isShowAdd}
                    onOk={this.addRole}
                    onCancel={() => {
                        this.setState({isShowAdd: false});
                        this.form.resetFields();
                    }}
                    okText="确认"
                    cancelText="取消"
                >
                    <AddForm
                        setForm={(form) => {this.form = form}}
                    />
                </Modal>
                <Modal
                    title="设置角色权限"
                    visible={this.state.isShowAuth}
                    onOk={this.updateRole}
                    onCancel={() => {
                        this.setState({isShowAuth: false});
                    }}
                    okText="确认"
                    cancelText="取消"
                >
                    <AuthForm role={role} ref={this.auth}/>
                </Modal>
            </Card>
        )
    }
}