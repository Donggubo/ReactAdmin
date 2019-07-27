import React, {Component} from 'react';
/*引入Redirect, BrowerRouter和Switch组件*/
import { Redirect, Switch , Route } from 'react-router-dom';
/*导入antd的Layout布局组件*/
import { Layout } from 'antd';
/*引入保存数据到内存的模块，用来读取登录时输入的内容*/
import memoryUtils from '../../utils/memoryUtils';
/*导入自定义布局组件*/
import LeftNav from '../../components/left-nav';
import Header from '../../components/header';
/*引入自定义组件*/
import Home from '../home/home';
import User from '../user/user';
import Role from '../role/role';
import Product from '../product/product';
import Category from '../category/category';
import Pie from '../charts/pie';
import Line from '../charts/line';
import Bar from '../charts/bar';
const { Footer, Sider, Content } = Layout;// 将Layout的布局组件结构化
export default class Admin extends Component {
    render() {
        // 获取内存中的user数据
        const user = memoryUtils.user;
        // 判断用户是否登录
        if(!user || !user._id){
            // 如果用户没登录，自动跳转到登录页面
            return <Redirect to='/login'/>
        }
        return (
            <Layout style={{minHeight: '100%'}}>
                <Sider>
                    <LeftNav/>
                </Sider>
                <Layout>
                    <Header/>
                    <Content style={{margin: 20,backgroundColor: '#fff'}}>
                        <Switch>
                            <Route path='/home' component={Home}/>
                            <Route path='/product' component={Product}/>
                            <Route path='/category' component={Category}/>
                            <Route path='/user' component={User}/>
                            <Route path='/role' component={Role}/>
                            <Route path='/charts/pie' component={Pie}/>
                            <Route path='/charts/line' component={Line}/>
                            <Route path='/charts/bar' component={Bar}/>
                            <Redirect to='/home'/>
                        </Switch>
                    </Content>
                    <Footer style={{textAlign: 'center', backgroundColor: '#ccc', fontSize: '17px'}}>推荐使用谷歌浏览器，可以获得更佳页面操作体验</Footer>
                </Layout>
            </Layout>
        )
    }
}