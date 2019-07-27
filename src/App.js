/*导入React*/
import React, {Component} from 'react';
/*按需导入路由*/
import {BrowserRouter, Route, Switch} from 'react-router-dom';
/*导入Admin和Login组件*/
import Admin from './pages/admin/admin';
import Login from './pages/login/login';
export default class App extends Component{
    render() {
        return (
                <BrowserRouter>
                    <Switch>
                        <Route path='/login' component={Login}/>
                        <Route path='/' component={Admin}/>
                    </Switch>
                </BrowserRouter>
        )
    }
}