import React, {Component} from "react";
/*导入样式*/
import './index.less';
/*导入从内存获取用户信息的工具模块*/
import memoryUtils from '../../utils/memoryUtils';
/*导入日期格式化模块*/
import {formatDate} from "../../utils/dateformatUtils";
/*导入获取天气信息的函数*/
import {reqWeather} from "../../api";
/*导入包装非路由组件的withRouter以便获取path*/
import {withRouter} from 'react-router-dom';
/*导入路径配置信息*/
import menuList from '../../config/menuConfig';
/*用于退出删除用户信息*/
import storageUtils from '../../utils/storageUtils';
/*导入LinkButton*/
import LinkButton from '../../components/link-button'
/*引入模态对话框*/
import { Modal } from 'antd';
const {confirm} = Modal;

class Header extends Component {
    // 数据信息
    state = {
        username: memoryUtils.user.username,// 从内存中获取用户信息
        currentTime: formatDate(Date.now()),// 调用日期格式化方法
        dayPictureUrl: '',
        weather: ''
    };
    // 设置计时器
    getTime = () => {
        // 获取定时器id用于清除时使用
       this.intervalId = setInterval(() => {
            const currentTime = formatDate(Date.now());
            this.setState({currentTime})// 设置最新获取的时间
        }, 1000)
    };
    // 获取天气信息
    getWeather = async () => {
        const {dayPictureUrl, weather} = await reqWeather('深圳');// 使用await和async直接将获取的值结构化出来
        /*reqWeather('上海').then(res => {
            console.log(res);
        });*/
        this.setState({dayPictureUrl, weather});// 设置天气信息
    };
    // 根据路径获取标题信息
    getTitle = () => {
        const path = this.props.location.pathname;// 获取路径
        // 遍历配置信息中的每一项
        menuList.forEach(item => {
            if(!item.children && item.key === path){
                // 没有子选项
                this.title = item.title;
            }else if(item.children){
                // 有子选项，调用find方法，因为子选项后面没有子选项
               const cItem = item.children.find(cItem => cItem.key === path);// find如果结果是true则返回cItem
               if(cItem){
                   this.title = cItem.title;
               }
            }
        })
    };
    // 退出
    logout = () => {
        confirm({
            title: '确定要退出吗？',
            // 将其改为箭头函数，改变this的作用域指向，使this代表组件对象
            onOk: () => {
                console.log('OK');
                //删除本地和内存中的用户信息
                storageUtils.removeUser();
                memoryUtils.user = {};// 删除内存中的user只需将其置为空对象
                this.props.history.replace('/login');
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };
    // 该函数在render执行后只执行一次
    componentDidMount() {
        this.getTime();
        this.getWeather();
        this.getTitle();
    }
    // 在程序消亡前最后一个执行的生命周期函数，清除定时器
    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    render() {
        this.getTitle();
        return (
            <div className='header'>
                <div className='header-top'>
                    <span>欢迎，{this.state.username}</span>
                    <LinkButton onClick={this.logout}>退出</LinkButton>
                </div>
                <div className='header-bottom'>
                    <div className='header-bottom-left'>{this.title}</div>
                    <div className='header-bottom-right'>
                        <span>{this.state.currentTime}</span>
                        <img src={this.state.dayPictureUrl} alt="weather"/>
                        <span>{this.state.weather}</span>
                    </div>
                </div>
            </div>
        )
    }
}
// 对非路由组件包装后即可获取location属性
export default withRouter(Header);