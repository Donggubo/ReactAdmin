/*导入核心组件*/
import React, {Component} from 'react';
/*导入路由链接*/
import {Link, withRouter} from 'react-router-dom';
/*导入样式*/
import './index.less';
/*导入logo*/
import logo from '../../assets/images/logo.png';
/*导入菜单Menu*/
import { Menu, Icon } from 'antd';
/*导入导航菜单配置文件*/
import menuList from '../../config/menuConfig';
import memoryUtils from "../../utils/memoryUtils";
const { SubMenu }  = Menu;
class LeftNav extends Component {
    /*根据menu的数据数组生成对应的标签数组
    * 使用map()+递归调用
    * */
    getMenuNodes_map = (menuList) => {
        return menuList.map((item) => {
            if(!item.children){
                return (
                    <Menu.Item key={item.key}>
                        <Link to={item.key}>
                            <Icon type={item.icon} />
                            <span>{item.title}</span>
                        </Link>
                    </Menu.Item>
                )
            }else{
                return (
                    <SubMenu
                        key={item.key}
                        title={
                            <span>
                            <Icon type={item.icon} />
                            <span>{item.title}</span>
                        </span>
                        }
                    >
                        {
                            this.getMenuNodes(item.children)
                        }
                    </SubMenu>
                )
            }
        })
    };
    /*根据menu的数据数组生成对应的标签数组
    * 使用reduce()+递归调用
    * */
    getMenuNodes = (menuList) => {
        console.log("menus", memoryUtils.user.role.menus);// 当前登录用户的列表权限
        // 获取path
        const path = this.props.location.pathname;
        return menuList.reduce((pre, item) => {
            console.log("item", item);
            // 判断当前用户的menus，如果menuList中单个item的key在menus中则需要显示左侧列表
            if(this.hasAuth(item)){
                if(!item.children){// 没有子选项item
                    pre.push((
                        <Menu.Item key={item.key}>
                            <Link to={item.key}>
                                <Icon type={item.icon} />
                                <span>{item.title}</span>
                            </Link>
                        </Menu.Item>
                    ));
                }else{
                    // 进入该分支说明有子选项，调用find方法如果路径包含子选项的key则返回该子选项--优化product组件68视频
                    const citem = item.children.find(citem => path.indexOf(citem.key) === 0);
                    if(citem){
                        // 如果子选项有值则将该子选项所属上级的key赋值给当前组件的openKey
                        this.openKey = item.key;
                    }
                    pre.push((
                        <SubMenu
                            key={item.key}
                            title={
                                <span>
                            <Icon type={item.icon} />
                            <span>{item.title}</span>
                        </span>
                            }
                        >
                            {
                                this.getMenuNodes(item.children)
                            }
                        </SubMenu>
                    ));
                }
            }
            return pre;
        }, []);
    };
    // 判断item中的key是否在当前登录用户的menus中
    hasAuth = (item) => {
        const {key, isPublic} = item;
        const menus = memoryUtils.user.role.menus;
        const username = memoryUtils.user.username;
        // 1.当前用户是admin
        // 2.判断item的key是否在当前登录用户的menus中
        // 3.用户没有任何权限时，默认显示的（例如：首页所有用户都可见），在item中添加属性isPublic并设置为true，如果当前权限是公开返回true
        if(username === 'admin' || isPublic || menus.indexOf(key) !== -1){
            return true;
        }else if(item.children){ // 4.如果当前用户有此item的某个子item的权限，缺少这一步如果有其中的一个子权限则不会显示
            return !! item.children.find(child => menus.indexOf(child.key) !== -1);// !!强制转为布尔类型
        }
        return false;
    };
    componentWillMount() {
        // 此方法最先调用，否则该组件的openKey为undefined状态
        this.menuNodes = this.getMenuNodes(menuList);
    }
    render() {
        // 可以在这里调用getMenuNodes，但是每次更新都会调用getMenuNodes，浪费性能，所以在componentWillMount调用，只执行一次
        let path = this.props.location.pathname;
        // 查找该路由的子路由时也进行默认选中--优化product组件68视频
        if(path.indexOf('/product') === 0){
            path = '/product';
        }
        // 将子选项所属上级的key赋值给常量用于打开子菜单
        const openKey = this.openKey;// 其实就是item.key，使用this当前对象用于起到中转作用
        return (<div className='left-nav'>
            <Link to='/' className='left-nav-header'>
                <img src={logo} alt="logo"/>
                <h1>硅谷后台</h1>
            </Link>
            <Menu
                selectedKeys={[path]}
                defaultOpenKeys={[openKey]}
                mode="inline"
                theme="dark"
            >
                {this.menuNodes}
            </Menu>
        </div>)
    }
}
/*对非路由组件进行包装，以便获取路由组件的三个属性*/
export default withRouter(LeftNav);