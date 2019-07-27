import React, {Component} from "react";
import {
    Card,
    Icon,
    Form,
    Input,
    Button,
    Cascader,
    message
} from "antd";
import LinkButton from "../../components/link-button";
import {reqCategorys} from "../../api/";// 获取一级或某个二级分类列表的接口请求函数
import PicturesWall from "./pictires-wall";// 引入照片上传组件
import RichTextEditor from "./rich-text-editor";// 引入富文本编辑器
import {reqAddOrUpdateProduct} from "../../api/"; // 引入更新或者添加商品接口请求函数

const Item = Form.Item;
const TextArea = Input.TextArea;
/*const options = [
    {
        value: 'zhejiang',
        label: 'Zhejiang',
        isLeaf: false,
    },
    {
        value: 'jiangsu',
        label: 'Jiangsu',
        isLeaf: false,
    },
    {
        value: 'jiangsu2',
        label: 'Jiangsu2',
        isLeaf: true,
    },
];*/
class ProductAddUpdate extends Component {
    state = {
        options:[]
    };
    // 构造函数创建子标签容器，用于获取子（组件）标签对象一遍调用其方法
    constructor(props){
        super(props);
        this.pw = React.createRef();// 照片墙容器
        this.editor = React.createRef();// 富文本编辑器容器
    }
    // 请求分类数据
    getCategorys = async (parentId) => {
        const result = await reqCategorys(parentId);
        if(result.status === 0){// 请求数据成功
            const categorys = result.data;// 获取分类数组
            // 根据parentId是否为0来获取一级还是二级分类列表
            if(parentId === '0'){
                this.initOptions(categorys);// 调用方法传递分类数组参数
                // console.log(categorys);// [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}] {parentId: "0", _id: "5c2ed64cf352726338607048", name: "电脑", __v: 0}
            }else{
                return categorys;// 返回二级列表
            }
        }
    };
    // 初始化options数据源
    initOptions = async (categorys) => {
        // 该处传递的categorys是一级分类数据
        const options = categorys.map(c => ({// 将分类数组通过map方法返回一个新的对象用于作为级联选择的数据源
                value: c._id,
                label: c.name,
                isLeaf: false,
            })
        );
        // 用于修改时展示二级分类列表
        const {isUpdate, product} = this;
        const {pCategoryId} = product;
        // console.log(isUpdate);
        // console.log(product);
        // console.log(pCategoryId);
        // console.log(categoryId);
        if (isUpdate && pCategoryId !== '0') {// pCategoryId不为0说明是二级分类数据
            const subCategorys = await this.getCategorys(pCategoryId);// 获取二级分类列表数据，执行的是getCategorys方法中的return categorys;
            // console.log(subCategorys);
            // 将二级分类数据转成新的数组
            const childOptions = subCategorys.map(c => ({
                value: c._id,
                label: c.name,
                isLeaf: true,
            }));
            // 根据一级分类数据的_id（option的value）找到要添加的目标选项
            const targetOption = options.find(option => option.value === pCategoryId);
            targetOption.children = childOptions;
        }
        // 更新state的值
        this.setState({options});
    };
    // 提交表单并验证
    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                // values是表单输入框的数据数组
                //console.log('Received values of form: ', values);
                // 收集的图片名称数组用于提交给后台（从pw容器的current属性中获取图片墙标签（组件）对象）
                const imgs = this.pw.current.getImgs();// 收集图片名称，用于提交（调用方法一定要带()，否则返回的只是函数的字符串）
                // 获取富文本编辑器的对象并调用其方法（从editor容器的current属性中获取富文本编辑器对象）
                const detail = this.editor.current.getDetail();// 收集富文本编辑器的内容，用于提交
                //console.log(detail);
                const {name, desc, price, categoryIds} = values;// 获取表单中的值
                let product;// 定义对象用于发送请求
                let pCategoryId; // 定义一级分类id
                let categoryId ; // 定义二级分类id
                if (categoryIds.length === 1) { // 如果分类id数组长度为1，说明是一级分类下的商品，此时父级分类id是0
                    pCategoryId = '0';
                    categoryId = categoryIds[0];
                } else {
                    pCategoryId = categoryIds[0]; // 如果分类id数组长度为2，说明是二级分类下的商品，此时一级分类id是categoryIds数组的第0个元素，二级分类id是categoryIds数组的第1个元素
                    categoryId = categoryIds[1];
                }
                // 将需要的参数赋值给product对象
                product = {name, desc, price, pCategoryId, categoryId, imgs, detail};
                if(this.isUpdate){// 判断是否是更新，如果为更新则将this的product的_id赋值给参数product，不能和product = {name, desc, price, pCategoryId, categoryId, imgs, detail};颠倒顺序
                    product._id = this.product._id
                    // console.log("product._id", product._id);
                    // console.log(product);
                }
                //console.log(product);
                const result = await reqAddOrUpdateProduct(product);// 发送请求并获取结果
                if(result.status === 0){// 提示信息
                    message.success(`${this.isUpdate?'更新': '添加'}成功`);
                    this.props.history.goBack();
                }else{
                    message.error(`${this.isUpdate?'更新': '添加'}失败`);
                }
            }
        });
    };
    // 自定义验证价格
    validatePrice = (rule, value, callback) => {
        // console.log(typeof value);
        if(value*1 > 0){
            callback();
        }else{
            callback("价格必须大于0");
        }
    };
    /*点击下拉列表时才会触发，加载下一级的回调函数*/
    loadData = async selectedOptions => {// 参数是选项数组
        // 选中的一级列表对象
        const targetOption = selectedOptions[selectedOptions.length - 1];
        // console.log(targetOption);// targetOption的数据格式{value: "5c2ed64cf352726338607048", label: "电脑", isLeaf: false}
        targetOption.loading = true;// 添加loading属性，设置加载效果
        // 根据选中的分类请求下一级分类列表数据
        const subCategorys = await this.getCategorys(targetOption.value);// 传递的parentId不为0时，执行getCategorys方法的return categorys，getCategorys使用async修饰返回的仍是Promise对象，因此此处使用await修饰直接返回结果数据
        targetOption.loading = false;// 请求数据结束，加载效果消失
        //console.log(subCategorys);// 数据格式[{…}, {…}, {…}, {…}] 数组单个元素{parentId: "5c2ed64cf352726338607048", _id: "5d1366c772c01d13a4d7f9e1", name: "笔记本电脑", __v: 0}
        // 判断subCategorys是否为空，如果为空则说明没有二级分类，isLeaf的值为true
        if(subCategorys && subCategorys.length > 0){// 说明有二级分类
            const childTargetOption = subCategorys.map(c => ({// 组织出二级分类数据
                value: c._id,
                label: c.name,
                isLeaf: true,// 此处二级分类没有下一级分类
            }));
            targetOption.children = childTargetOption;// 将二级分类数据赋值给一级分类的children属性
        }else{// 没有二级分类
            targetOption.isLeaf = true;
        }
        // 更新state中option的值，通过展开运算符将字符串展开，那么字符串的每一个字符构成一个数组元素。
        this.setState({
            options: [...this.state.options],// this.state.options是从Cascader的options属性传递过来的，将改变后的options更新到state中
        })
        // 设置定时器，延时执行方法
       /* setTimeout(() => {
            targetOption.loading = false;
            // 给children属性赋值
            targetOption.children = [
                {
                    label: `${targetOption.label} Dynamic 1`,
                    value: 'dynamic1',
                },
                {
                    label: `${targetOption.label} Dynamic 2`,
                    value: 'dynamic2',
                },
            ];
            // 更新state中option的值
            this.setState({
                options: [...this.state.options],// 使用展开运算符结构数组
            });
        }, 1000);*/// 延时1秒执行
    };
    // 为第一次render做数据准备
    componentWillMount() {
        // 获product-home.jsx中取点击修改按钮时传递的对象
        // product-home.jsx中如果修改按钮按照{product}传递数据，则添加商品按钮需要传递一个空对象{}，否则const {product} = this.props.location.state会报错
        // product-home.jsx中如果修改按钮按照product传递数据，则添加商品按钮不需要传递任何数据
        const {product} = this.props.location.state;
        this.isUpdate = !!product;// 等价于this.isUpdate = product?true: false;
        this.product = product || {};// 将product赋值给this对象上的product属性，用于render中获取，{}避免报错，因为点击添加商品时传递的是空对象，此处取到的product是undefined，所以将{}赋值给this.product，在render中由于this.product是{}，所以获取product.name时是undefined，不报错也不展示页面任何内容
        // console.log(product);
        // console.log(this.isUpdate);
    }
    // 钩子函数进入页面后首先调用请求分类数据的方法获取分类数据
    componentDidMount() {
        this.getCategorys('0');
    }
    render() {
        // 获取this.isUpdate标识来判断是添加商品还是修改商品
        const {isUpdate} = this;
        // 获取product用于修改时显示，当product是{}时，product.name等是undefined，不会报错
        const {product} = this;
        console.log(product);
        // 获取修改时的product的categoryId和pCategoryId
        const {pCategoryId, categoryId, imgs, detail} = product;// 结构出imgs数组传递给pictures-wall组件用于更新时显示，detail用于富文本编辑器
        // console.log(product.name);
        // 定义categoryIds用于级联初始值显示，接收的是商品的pCategoryId,categoryId
        const categoryIds = [];
        // 判断是否为更新，如果为更新则将pCategoryId, categoryId放入categoryIds数组中
        if(isUpdate){
            if(pCategoryId === '0'){// 此处表示一级分类列表下的商品
                categoryIds.push(categoryId);
            }else{// 二级分类列表下的商品
                categoryIds.push(pCategoryId);
                categoryIds.push(categoryId);
            }
        }
        //console.log(categoryIds);
        const { getFieldDecorator } = this.props.form;
        const title = (
            <span>
                <LinkButton onClick={() => this.props.history.goBack()} style={{fontSize: 18}}>
                    <Icon type='arrow-left'/>
                </LinkButton>
                <span>{isUpdate?'修改商品': '添加商品'}</span>
            </span>
        );
        // Item的布局
        const formItemLayout = {
            labelCol: { span: 3 },// label左侧的宽度
            wrapperCol: { span: 8 },// 右侧包裹input的宽度
        };
        return (
            <Card title={title}>
                <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                    <Item label="商品名称">
                        {getFieldDecorator('name',{
                            initialValue: product.name,
                            rules: [
                                {required: true, message: '必须输入商品名称'}
                                ]
                        })(
                            <Input placeholder='请输入商品名称'/>
                        )}
                    </Item>
                    <Item label="商品描述">
                        {getFieldDecorator('desc',{
                            initialValue: product.desc,
                            rules: [{required: true, message: '必须输入商品描述'}]
                        })(
                            <TextArea placeholder='请输入商品描述' autosize={{ minRows: 2, maxRows: 6 }}/>
                        )}
                    </Item>
                    <Item label="商品价格">
                        {getFieldDecorator('price',{
                            initialValue: product.price,
                            rules: [
                                {required: true, message: '必须输入商品价格'},
                                {validator: this.validatePrice}
                            ]
                        })(
                            <Input type='number' placeholder='请输入商品价格' addonAfter="元"/>
                        )}
                    </Item>
                    <Item label="商品分类">
                        {getFieldDecorator('categoryIds',{
                            initialValue: categoryIds,// 添加商品点击提交按钮时的数据格式{name: "1", desc: "1", price: "1", categoryIds: Array(2)}
                                                      // 其中categoryIds的数据是级联选择后的product的pCategoryId和categoryId：categoryIds: (2) ["5c2ed64cf352726338607048", "5d1366c772c01d13a4d7f9e1"]
                                                      // 所以initialValue的categoryId也应该是一个数组，里面方法的是product的pCategoryId和categoryId，用于修改时显示
                            rules: [
                                {required: true, message: '必须输入商品分类'},
                            ]
                        })(
                            <Cascader
                                placeholder='请输入商品分类'
                                options={this.state.options}/*数据源即需要显示的列表数据，格式是数组*/
                                loadData={this.loadData}/*回调函数加载下一级的数据，点击一级分类的选项（加载下一级列表时）触发该函数，如果没有下一级则不触发*/
                                onChange={this.onChange}
                                changeOnSelect
                            />
                        )}
                    </Item>
                    <Item label="商品图片">
                        <PicturesWall ref={this.pw} imgs={imgs}/>
                    </Item>
                    <Item label="商品详情" labelCol={{span: 3}} wrapperCol={{span: 20}}>{/* 指定富文本编辑框的样式*/}
                        <RichTextEditor ref={this.editor} detail={detail}/>
                    </Item>
                    <Item>
                        <Button type='primary' htmlType="submit">提交</Button>
                    </Item>
                </Form>
            </Card>
        )
    }
}
export default Form.create()(ProductAddUpdate);