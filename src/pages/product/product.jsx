import React, {Component} from "react";
import {BrowserRouter, Route, Switch, Redirect} from 'react-router-dom';
import ProductAddUpdate from './product-add-update';
import ProductHome from './product-home';
import ProductDetail from './product-detail';
import './product.less';// 引入样式表
export default class Product extends Component {
    render() {
        return (<BrowserRouter>
            <Switch>
                <Route exact path='/product' component={ProductHome}/>
                <Route exact path='/product/addupdate' component={ProductAddUpdate}/>
                <Route exact path='/product/detail' component={ProductDetail}/>
                <Redirect to='/product'/>
            </Switch>
        </BrowserRouter>)
    }
}