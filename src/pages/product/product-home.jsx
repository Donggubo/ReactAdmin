import React, {Component} from "react";
import {
    Card,
    Select,
    Input,
    Icon,
    Table,
    Button,
    message,
    Modal
} from "antd";
import LinkButton from '../../components/link-button';
// 引入接口请求函数
import {reqProducts, reqSearchProducts, reqUpdateStatus, reqProduct, reqDeleteProduct} from '../../api';
// 引入常量模块
import {PAGE_SIZE} from '../../utils/constants';
const Option = Select.Option;
const {confirm} = Modal;
export default class ProductHome extends Component {
    state = {
        total: 0, // 数据总条数
        products: [], // Table的数据源
        loading: false, // 加载效果
        searchName: '', // 搜索的关键字
        searchType: 'productName' // 按哪个字段搜索，默认按照productName
    };
    // 初始化表格列的方法
    initColumns = () => {
        this.columns = [
            {
                title: '商品名称',
                dataIndex: 'name'/*dataIndex对应数据对象的属性*/
            },
            {
                title: '商品描述',
                dataIndex: 'desc'
            },
            {
                title: '价格',
                dataIndex: 'price',/*指定dataIndex后，render接收的就是指定的dataIndex值，如果没有则接收的是当前行的数据对象*/
                render: (price) => ("￥" + price)
            },
            {
                title: '状态',
                // dataIndex: 'status',
                width: 100,
                render: (product) => (
                    <span>
                        <Button type='primary' onClick={() => {this.updateStatus(product._id, product.status === 1 ? 2: 1)}}>
                            {product.status === 1 ? '下架': '上架'}
                        </Button>
                        <span>{product.status === 1 ? '在售': '已下架'}</span>
                    </span>
                )
            },
            {
                title: '操作',
                width: 100,
                render: (product) => (
                    <span>
                        {/*将product对象使用state传递给目标路由组件，以{product}方式传递，则product是state的一个属性，BrowserRouter只支持这种方式传递对象，HashRouter不支持
                        在product-detail中通过this.props.location.state.product获取product对象
                        */}
                        <LinkButton onClick={() => this.props.history.push('/product/detail', {product})}>详情</LinkButton>
                        <LinkButton onClick={() => this.props.history.push('/product/addupdate', {product})}>修改</LinkButton>
                        <LinkButton onClick={() => this.deleteProduct(product)}>删除</LinkButton>
                    </span>
                )
            }
        ]
    };
    // 请求products数据
    getProducts = async (pageNum) => {
        this.pageNum = pageNum;// 将当前请求的页码存储到this对象中用于更新状态后的请求数据
        this.setState({loading: true});// 设置加载效果
        const {searchName, searchType} = this.state;// 从state中取出searchName和searchType，用于搜索
        let result;
        if(searchName){// 如果searchName有值则说明按照关键字搜索
            result = await reqSearchProducts({pageNum, pageSize: PAGE_SIZE, searchType, searchName})
        }else{// 此处按照一般搜索
            result = await reqProducts(pageNum, PAGE_SIZE);
        }
        this.setState({loading: false});// 此处取消加载效果
        if(result.status === 0){// 请求成功，获取需要展示的数据
            const {total, list} = result.data;
            this.setState({
                total,
                products: list
            })
        }
    };
    // 更新商品状态
    updateStatus = async (productId, status) => {
        // 更新商品状态
        //const result  = await reqUpdateStatus(productId, status);
        // 请求商品信息
        //const product = await reqProduct(productId);
        // 使用Promise的all方法发送多个ajax请求
        const results = await Promise.all([reqUpdateStatus(productId, status), reqProduct(productId)]);
        if(results[0].status === 0){
            message.success(results[1].data.name + (status === 1 ? '上架': '下架') + '成功');
            this.getProducts(this.pageNum);//再次发起请求数据
        }else{
            message.error(results[1].data.name + (status === 1 ? '上架': '下架') + '失败');
        }
    };
    // 根据产品ID删除产品
    deleteProduct = (product) => {
        const productId = product._id;
        confirm({
            title: '确定要删除吗？',
            // 将其改为箭头函数，改变this的作用域指向，使this代表组件对象
            onOk: async () => {
                console.log('OK');
                // 执行删除
                const result = await reqDeleteProduct(productId);
                if(result.status === 0){// 判断删除成功
                    message.success('删除产品成功');
                    // c.重新显示列表
                    this.props.history.replace("/");
                }else{
                    message.error('删除产品失败');
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };
    // componentWillMount函数为第一渲染页面准备数据
    componentWillMount() {
        this.initColumns();
    }
    // componentDidMount函数发送ajax请求
    componentDidMount() {
        this.getProducts(1);
    }
    render() {
        const {products, total, loading, searchName, searchType} = this.state;// 从state中结构出数据源和检索使用的数据
        /*Card布局用开始*/
        // Card的左边显示的布局
        const title = (
            <span>
                <Select
                    value={searchType}/*取出state中的searchType的值*/
                    style={{width: 120}}
                    onChange={value => this.setState({searchType:value})}/*选中 option，或 input 的 value 变化时，调用此函数，按照Option的value值设置state中的searchType的值*/
                >
                    <Option value='productName'>按名称搜索</Option>{/*受控组件*/}
                    <Option value='productDesc'>按描述搜索</Option>
                </Select>
                <Input
                    placeholder='关键字'
                    style={{width: 120, margin: '0 10px'}}
                    value={searchName}
                    onChange={event => this.setState({searchName:event.target.value})}
                />
                <Button type='primary' onClick={() => {this.getProducts(1)}}>搜索</Button>
            </span>
        );
        // Card的右边显示的布局
        const extra = (
            <Button type='primary' onClick={() => {this.props.history.push('/product/addupdate', {})}}>
                <Icon type='plus'/>
                添加商品
            </Button>
        );
        /*Card布局用结束*/
        return (
            <Card title={title} extra={extra}>
                <Table
                    bordered
                    rowKey='_id'
                    dataSource={products}
                    columns={this.columns}
                    pagination={{
                        current: this.pageNum,// 解决搜索时页数显示错误的问题，点击搜索按钮时传递的pageNum是1，因此搜索后显示第一页
                        defaultPageSize: PAGE_SIZE,
                        showQuickJumper: true,
                        total,
                        //onChange: (pageNum) => {this.getProducts(pageNum)} // 完整写法，页码发生改变时触发的函数，再次请求下一页的数据
                        onChange: this.getProducts // 省略写法
                    }}
                    loading={loading}
                />
            </Card>
        )
    }
 }