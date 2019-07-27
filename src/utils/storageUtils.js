import store from 'store';
const USER_KEY = 'user_key';// localStorage的方法需要key
export default {
    // 保存用户
    saveUser(user){
        store.set(USER_KEY, user);
    },
    // 获取用户
    getUser(){
        return store.get(USER_KEY) || {};
    },
    // 删除用户
    removeUser(){
        store.remove(USER_KEY);
    }
}