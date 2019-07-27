import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import App from './App';
// 在入口文件从本地读取用户数据并放入内存，用于判断用户是否登录
import memoryUtils from './utils/memoryUtils';
import storageUtils from './utils/storageUtils';
// 读取本地数据
const user = storageUtils.getUser();
// 判断本地读取的数据是否存在，如果存在则放入内存
if(user && user._id){
    memoryUtils.user = user;
}
ReactDOM.render(<App/>, document.getElementById("root"));
