import React, {Component} from "react";
import { Card, Table, Button, Icon, message, Modal } from 'antd';
import LinkButton from '../../components/link-button';
// 导入获取分类列表的接口
import {reqCategorys, reqUpdateCategory, reqAddCategory, reqDeleteCategory} from "../../api";
// 引入Form组件
import AddForm from './add-form';
import UpdateForm from './update-form';
/*获取模态对话框的confirm，删除时确认信息*/
const {confirm} = Modal;
export default class Category extends Component {
    state = {
        categorys: [],// 一级分类列表
        subCategorys: [],//二级分类列表
        loading: false,// 页面加载效果
        parentId: '0',//当前需要显示的分类列表的parentId
        parentName: '',// 当前需要显示的分类列表的父分类名称
        showStatus: 0// Modal对话框的状态，0表示不显示，1表示显示添加界面，2表示显示更新界面
    };
    // 初始化表格的列方法，用于在钩子函数中调用
    initColumns = () => {
        this.columns = [
            {
                title: '分类名称',
                dataIndex: 'name'
            },
            {
                title: '操作',
                render: (category) => (
                    <span>
                        <LinkButton onClick={() => this.showUpdateCategorys(category)}>修改分类</LinkButton>{/*传递分类对象*/}
                        {/*判断在二级分类列表时是否显示‘查看子分类’*/}
                        {this.state.parentId === '0'?<LinkButton onClick={() => this.showSubCategorys(category)}>查看子分类</LinkButton>:null}
                        <LinkButton onClick={() => this.deleteCategorys(category)}>删除分类</LinkButton>
                    </span>
                ),
                width: 300
            }
        ];
    };
    // 获取一级/二级分类数据
    getCategorys = async (parentId) => {
        // 请求数据前进行显示加载
        this.setState({loading: true});
        // 获取state中的parentId或者传递过来的id
        parentId = parentId || this.state.parentId;
        // 获取请求数据
        const result = await reqCategorys(parentId);
        // 请求数据后加载效果消失
        this.setState({loading: false});
        // result数据格式{status: 0, data: Array(4)}
        // 判断是否请求成功
        if(result.status === 0){
            // 取出分类数据（可能是一级分类也可能是二级分类）
            const categorys = result.data;
            // 判断parentId进行分类更新
            if(parentId === '0'){
                // 更新一级分类
                this.setState({categorys})
            }else{
                // 更新二级分类
                this.setState({subCategorys: categorys})
            }
        }else{
            message.error('获取一级分类列表失败')
        }
    };
    // 点击链接时显示二级分类列表，接收的参数是一级分类对象
    showSubCategorys = (category) => {
        // 更新状态，使用setState的回调函数，setState是异步函数
        this.setState({
            parentId: category._id,
            parentName: category.name
        }, () => {
            // 调用getCategorys来获取分类数据
            this.getCategorys();
        })
    };
    // 在二级分类列表的状态下点击‘一级分类列表'连接，将parentId置为0，parentName置为空字符串，subCategorys置为空数组
    showCategorys = () => {
      this.setState({
          parentId: '0',
          parentName: '',
          subCategorys: []
      })
    };
    // 显示添加分类界面
    showAddCategorys = () => {
        this.setState({
            showStatus: 1
        })
    };
    // 执行添加分类
    addCategory = () => {
        // 验证表单，form对象通过this获取而非this.props
        this.form.validateFields(async (err, values) => {
            console.log(values);
            if (!err) {
                console.log('addCategory()');
                // a.设置状态关闭对话框
                this.setState({
                    showStatus: 0
                });
                // b.发送请求完成更新
                // const {parentId, categoryName} = this.form.getFieldsValue();// 通过从子组件获取的form对象，调用该对象的getFieldsValue方法，结构出所需数据，该数据是从add-form组件的唯一标识中获取的
                const {parentId, categoryName} = values;// 使用表单验证后直接从values中结构出所需数据
                const result = await reqAddCategory(parentId, categoryName);//调用reqAddCategory传递参数并获取结果数据
                // console.log(typeof result.status);
                if(result.status === 0){// 判断添加成功
                    this.form.resetFields();//添加成功后清空缓存，避免点击修改下一个时出现原来的值
                    if(parentId === this.state.parentId){//添加的分类属于当前展开的分类则重新加载列表
                        // c.重新显示列表
                        this.getCategorys();
                    }else if(parentId === '0'){// 如果给一级分类列表添加分类获取刷新一级分类列表，返回上一级时可以看到
                        this.getCategorys('0');
                    }// 在二级分类列表下添加其他二级分类列表的数据则不进行任何请求，因为点击其他二级分类时会请求
                }else{
                    message.error('添加分类失败')
                }
            }
        });
    };
    // 显示更新分类界面
    showUpdateCategorys = (category) => {
        // 将接收到的分类对象保存到this组件中
        this.category = category;
        // 更新状态
        this.setState({
            showStatus: 2
        })
    };
    // 执行更新分类
    updateCategory = () => {
        // 验证表单
        this.form.validateFields(async (err, values) => {
            console.log('err', err);
            console.log('values', values);
            // 验证通过后才进行更新操作
            if (!err) {
                console.log('updateCategory()');
                // a.设置状态关闭对话框
                this.setState({
                    showStatus: 0
                });
                // b.发送请求完成更新
                const categoryId = this.category._id;// 调用showUpdateCategorys传递的category赋值给this.category，从中获取categoryId
                // const categoryName = this.form.getFieldValue('categoryName');// 使用从子组件接收的form获取输入的categoryName
                const {categoryName} = values;// 验证表单后，直接从values中结构出来categoryName
                const result = await reqUpdateCategory({categoryId, categoryName});//调用reqUpdateCategory传递参数并获取结果数据
                console.log(typeof result.status);
                if(result.status === 0){// 判断更新成功
                    this.form.resetFields();//更新成功后清空缓存，避免点击修改下一个时出现原来的值
                    // c.重新显示列表
                    this.getCategorys();
                }else{
                    message.error('修改分类失败')
                }
            }
        });
    };
    // 点击‘取消’、‘×’或者遮罩时隐藏Modal对话框
    hideModal = () => {
        this.form.resetFields();//点击关闭时清空缓存
        this.setState({
            showStatus: 0
        })
    };
    // 根据id删除分类，如果有子分类则先删除子分类后再删除该分类
    deleteCategorys = async (category) => {
        console.log(category._id);
        const parentId = category._id;
        const result = await reqCategorys(parentId);// 请求该分类的子分类
        confirm({
            title: '确定要删除吗？',
            // 将其改为箭头函数，改变this的作用域指向，使this代表组件对象
            onOk: async () => {
                console.log('OK');
                // 判断该分类是否有子分类
                if(result.data.length === 0){//如果长度为0说明没有子分类则可以删除该分类
                    // 执行删除
                    const result = await reqDeleteCategory(category._id);
                    if(result.status === 0){// 判断删除成功
                        // c.重新显示列表
                        this.getCategorys();
                    }else{
                        message.error('删除分类失败')
                    }
                }else{
                    message.error('请先删除子分类')
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };
    // 为第一次render做数据准备
    componentWillMount() {
        this.initColumns();
    }
    // 发送ajax请求
    componentDidMount() {
        // 获取一级分类列表，因为parentId的初始值为0
        this.getCategorys();
    }
    render() {
        // 从state中结构出一级分类列表数据和加载效果
        const {categorys, loading, parentId, parentName, subCategorys} = this.state;
        // 获取分类对象
        const category = this.category || {};// 第一次render时，category还没有值，所以给其一个空对象，避免报错
        // console.log(category.name);
        // console.log(category);
        // card的左侧
        const title = parentId === '0'?'一级分类列表': (
            <span>
                <LinkButton onClick={this.showCategorys}>一级分类列表</LinkButton>
                <Icon type='arrow-right' style={{marginRight:5}}/>
                <span>{parentName}</span>
            </span>
        );
        // card的右侧
        const extra = (
            <Button type='primary' onClick={this.showAddCategorys}>
                <Icon type='plus'/>
                添加
            </Button>
        );
        // table使用数据被categorys替代
        /*const dataSource = [
            {
                "parentId": "0",
                "_id": "5c2ed64cf352726338607048",
                "name": "1分类3",
                "__v": 0
            },
            {
                "parentId": "0",
                "_id": "5c2ed647f352726338607047",
                "name": "分类2",
                "__v": 0
            },
            {
                "parentId": "0",
                "_id": "5c2ed631f352726338607046",
                "name": "分类001",
                "__v": 0
            },
            {
                "parentId": "0",
                "_id": "5d137e9592f54d1fa89b47bd",
                "name": "测试添加33",
                "__v": 0
            }
        ];*/
        // table布局，将其放到专门的方法中，避免多次渲染
        /*const columns = [
            {
                title: '分类名称',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '操作',
                dataIndex: 'delete',
                key: 'delete',
                render: () => (
                    <span>
                        <LinkButton>修改分类</LinkButton>
                        <LinkButton>查看子分类</LinkButton>
                    </span>
                ),
                width: 300
            }
        ];*/
        return (
            <Card title={title} extra={extra}>
                <Table
                    dataSource={parentId === '0'? categorys: subCategorys}/*根据parentId来显示一级分类还是二级分类*/
                    columns={this.columns}/*给this当前组件对象追加的columns属性*/
                    bordered/*带边框*/
                    rowKey='_id'/*指定唯一id*/
                    pagination={{defaultPageSize:5, showQuickJumper: true}}/*配置分页*/
                    loading={loading}/*加载效果*/
                />
                <Modal
                    title="添加分类"
                    visible={this.state.showStatus === 1}
                    onOk={this.addCategory}
                    onCancel={this.hideModal}
                    okText="确认"
                    cancelText="取消"
                >
                    {/*传递分类对象数组categorys用于显示下拉列表，传递方法用于接收form对象，传递parentId表示要添加分类的父分类*/}
                    <AddForm
                        category={categorys}
                        setForm={(form) => {this.form = form}}
                        parentId={parentId}
                    />
                </Modal>
                <Modal
                    title="修改分类"
                    visible={this.state.showStatus === 2}
                    onOk={this.updateCategory}
                    onCancel={this.hideModal}
                    okText="确认"
                    cancelText="取消"
                >
                    <UpdateForm
                        categoryName={category.name}
                        setForm={(form) => {this.form = form}}
                    />{/*传递分类对象的name值，传递函数用于接收子组件的form*/}
                </Modal>
            </Card>
        )
    }
}