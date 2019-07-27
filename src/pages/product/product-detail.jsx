import React, {Component} from "react";
import {
    Card,
    List,
    Icon,
    message
} from "antd";
import LinkButton from '../../components/link-button';
import {BASE_IMG_URL} from '../../utils/constants';
import {reqCategory} from "../../api";// 引入根据分类ID获取分类接口请求函数
const Item = List.Item;
export default class ProductDetail extends Component {
    state = {
        cName1: '',// 上一级分类名称
        cName2: ''// 下一级分类名称
    };
    getCategoryName = async () => {
        // 获取商品的categoryId和pCategoryId
        const {categoryId, pCategoryId} = this.props.location.state.product;
        // 判断并发送请求
        if(pCategoryId === '0'){// 如果pCategoryId为0则说明是一级分类下的商品，只需要获取一级分类的名称即可
           const result = await reqCategory(categoryId);
           if(result.status === 0){
               const cName1 = result.data.name;
               this.setState({cName1});
           }else{
               message.error('获取分类名称失败');
           }
        }else{// 二级分类下的商品
            // Promise.all一次性发送多个请求，参数是promise的数组
            const results = await Promise.all([reqCategory(pCategoryId), reqCategory(categoryId)]);
            if(results[0].status === 0 && results[1].status === 0){
                const cName1 = results[0].data.name;
                const cName2 = results[1].data.name;
                this.setState({cName1, cName2})
            }else{
                message.error('获取分类名称失败');
            }
        }
    };
    // 钩子函数发送ajax请求，根据该商品的categoryId和pCategoryId获取分类名称
    componentDidMount() {
        this.getCategoryName()
    }

    render() {
        /*获取product-home传递的product对象并结构出所需数据*/
        /*根据传递方式不同获取方式也不同*/
        /*传递() => this.props.history.push('/product/detail', {product})
        * 获取const {name, desc, detail, price, imgs}  = this.props.location.state.product
        * */
        /*传递() => this.props.history.push('/product/detail', product}
        * 获取const {name, desc, detail, price, imgs}  = this.props.location.state
        * */
        const {name, desc, detail, price, imgs}  = this.props.location.state.product;
        // 获取商品的分类名称
        const {cName1, cName2} = this.state;
        const title = (
            <span>
                <LinkButton>
                    <Icon
                        type='arrow-left'
                        style={{marginRight: 10, fontSize: 20}}
                        onClick={() => this.props.history.goBack()}
                    />
                </LinkButton>
                <span>商品详情</span>
            </span>
        );
        return (
            <Card title={title} className='product-detail'>
                <List>
                    <Item>
                        <span className='left'>商品名称：</span>
                        <span>{name}</span>
                    </Item>
                    <Item>
                        <span className='left'>商品描述：</span>
                        <span>{desc}</span>
                    </Item>
                    <Item>
                        <span className='left'>商品价格：</span>
                        <span>{price}元</span>
                    </Item>
                    <Item>
                        <span className='left'>所属分类：</span>
                        <span>{cName1}{cName2?  '-->' + cName2 : ''}</span>
                    </Item>
                    <Item>
                        <span className='left'>商品图片：</span>

                        <span>
                            {/*遍历图片*/}
                            {imgs.map(img => (
                                <img
                                    className='product-img'
                                    src={BASE_IMG_URL + img}
                                    alt="img"
                                    key={img}
                                />
                            ))}
                        </span>
                    </Item>
                    <Item>
                        <span className='left'>商品详情：</span>
                        <span dangerouslySetInnerHTML={{__html: detail}}/>
                    </Item>
                </List>
            </Card>
        )
    }
}