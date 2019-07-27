/*
包含n个接口请求函数的模块
每个函数返回Promise
本文件使用分别暴露的方式
*/
// 引入ajax
import ajax from './ajax';
// 引入jsonp，发送天气请求
import jsonp from 'jsonp';
// 引入message用于提示
import {message} from 'antd';
// 请求的根路径
const BASE = '';
//登录--使用普通函数
/*export function reqLogin(username, password) {
    return ajax('/login', {username, password}, 'POST');
}*/
// export const reqLogin = (username, password) => ajax('/login', {username: username, password: password}, 'POST') ;
// 使用箭头函数
/**
 * 登录
 * @param user
 * @returns {Promise<AxiosResponse<T>>}
 */
//export const reqLogin = (username, password) => ajax('/login', {username, password}, 'POST') ;
export const reqLogin = (user) => ajax(BASE + '/login', user, 'POST') ;
/**
 * 天气信息
 * @param city
 * @returns {Promise<any>}
 */
export const reqWeather = (city) => {
    return new Promise((resolve, reject) => {
        const url = `http://api.map.baidu.com/telematics/v3/weather?location=${city}&output=json&ak=3p49MVra6urFRGOT9s8UBWr2`;
        jsonp(url, {}, (err, data) => {
            if(!err && data.status === 'success'){
                // 请求成功将需要的数据结构化
                const {dayPictureUrl, weather} = data.results[0].weather_data[0];
                resolve({dayPictureUrl, weather});
            }else{
                message.error('获取天气信息失败');
            }
        });
    })
};
/**
 * 获取一级或某个二级分类列表
 * @param parentId
 * @returns {Promise<AxiosResponse<T>>}
 */
export const reqCategorys = (parentId) => ajax(BASE + '/manage/category/list', {parentId}, 'GET');
/**
 * 添加分类
 * @param parentId
 * @param categoryName
 * @returns {Promise<AxiosResponse<T>>}
 */
export const reqAddCategory = (parentId, categoryName) => ajax(BASE + '/manage/category/add', {parentId, categoryName}, 'POST');
/**
 * 删除分类
 * @param categoryId
 * @returns {Promise<AxiosResponse<T>>}
 */
export const reqDeleteCategory = (categoryId) => ajax(BASE + '/manage/category/delete', {categoryId}, 'POST');
/**
 * 更新品类名称
 * @param categoryId
 * @param categoryName
 * @returns {Promise<AxiosResponse<T>>}
 */
export const reqUpdateCategory = ({categoryId, categoryName}) => ajax(BASE + '/manage/category/update', {categoryId, categoryName}, 'POST');
/**
 * 获取商品分页列表
 * @param pageNum
 * @param pageSize
 * @returns {Promise<AxiosResponse<T>>}
 */
export const reqProducts = (pageNum, pageSize) => ajax(BASE + '/manage/product/list', {pageNum, pageSize}, 'GET');
/**
 * 根据productDesc/productName搜索产品分页列表
 * @param pageNum
 * @param pageSize
 * @param searchName
 * @param searchType 该searchType的值根据下拉列表的值改变，使用searchType的值作为对象的属性需要用[]括起来，不使用[]则只是将searchType作为对象属性
 * @returns {Promise<AxiosResponse<T>>}
 */
export const reqSearchProducts = ({pageNum, pageSize, searchName, searchType}) => ajax(BASE + '/manage/product/search', {
    pageNum,
    pageSize,
    [searchType]: searchName
}, 'GET');
/**
 * 根据分类ID获取分类
 * @param categoryId
 * @returns {Promise<AxiosResponse<T>>}
 */
export const reqCategory = (categoryId) => ajax(BASE + '/manage/category/info', {categoryId}, 'GET');
/**
 * 更新商品状态
 * @param productId
 * @param status
 * @returns {Promise<AxiosResponse<T>>}
 */
export const reqUpdateStatus = (productId, status) => ajax(BASE + '/manage/product/updateStatus', {productId, status}, 'POST');
/**
 * 根据productId获取产品信息
 * @param productId
 * @returns {Promise<AxiosResponse<T>>}
 */
export const reqProduct = (productId) => ajax(BASE + '/manage/product/info', {productId}, 'GET');
/**
 * 删除图片
 * @param name
 * @returns {Promise<AxiosResponse<T>>}
 */
export const reqDeleteImg = (name) => ajax(BASE + '/manage/img/delete', {name}, 'POST');
/**
 * 更新或者添加商品
 * @param product
 * @returns {Promise<AxiosResponse<T>>}
 */
export const reqAddOrUpdateProduct = (product) => ajax(BASE + '/manage/product/' + (product._id ? 'update' : 'add'), product,'POST');
/**
 * 根据产品ID删除产品
 * @param productId
 * @returns {Promise<AxiosResponse<T>>}
 */
export const reqDeleteProduct = (productId) => ajax(BASE + '/manage/product/delete', {productId}, 'GET');
/**
 * 获取角色列表
 * @returns {Promise<AxiosResponse<T>>}
 */
export const reqRoles = () => ajax(BASE + '/manage/role/list', {}, 'GET');
/**
 * 添加角色
 * @param roleName
 * @returns {Promise<AxiosResponse<T>>}
 */
export const reqAddRole = (roleName) => ajax(BASE + '/manage/role/add', {roleName}, 'POST');
/**
 * 更新角色
 * @param role
 * @returns {Promise<AxiosResponse<T>>}
 */
export const reqUpdateRole = (role) => ajax(BASE + '/manage/role/update', role, 'post');
/**
 * 获取所有用户列表
 * @returns {Promise<AxiosResponse<T>>}
 */
export const reqUsers = () => ajax(BASE + '/manage/user/list');
/**
 * 删除用户
 * @param userId
 * @returns {Promise<AxiosResponse<T>>}
 */
export const reqDeleteUser = (userId) => ajax(BASE + '/manage/user/delete', {userId}, 'POST');
/**
 * 添加角色
 * @param user
 * @returns {Promise<AxiosResponse<T>>}
 */
export const reqAddOrUpdateUser = (user) => ajax(BASE + '/manage/user/'+(user._id ? 'update' : 'add'), user, 'POST');

