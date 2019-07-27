/*
能发送ajax 请求的函数模块
包装axios
函数的返回值是promise对象
封装aixos用于统一处理ajax请求异常
*/
// 引入axios
import axios from 'axios';
import {message} from 'antd';
/**
 *
 * @param url
 * @param data
 * @param type
 * @returns {Promise<AxiosResponse<T>>}
 */
export default function ajax (url, data={}, type='GET') {
    /*统一处理异常之后*/
    return new Promise((resolve, reject) => {
        // 1.执行ajax异步请求并返回promise
        let promise;
        if(type === 'GET'){
            promise = axios.get(url, {
                params: data
            })
        }else {
            promise = axios.post(url, data)
        }
        // 2.promise执行成功
        promise.then(response => {
            resolve(response.data);// 直接返回data，上层调用者无需再次获取
        // 3.promise执行失败，不调用reject，而是使用antd的message提示
        }).catch(error => {
            message.error(error.message);
        })
    });
    // 未统一处理异常之前
    /*let promise;
    if(type === 'GET'){
        promise = axios.get(url, {
            params: data
        })
    }else {
        promise = axios.post(url, data)
    }
    return promise;*/
}