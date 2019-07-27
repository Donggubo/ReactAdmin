import React, {Component} from "react";
import {Form, Input, Tree } from "antd";
import PropTypes from 'prop-types';
import menuList from '../../config/menuConfig';
const Item = Form.Item;
const { TreeNode } = Tree;
/*设置角色权限*/
export default class AddForm extends Component {
    // 接收父组件传递的属性
    static propTypes = {
        role: PropTypes.object,
    };
    state = {
        checkedKeys: []
    };
    constructor(props){
        super(props);
        const {menus} = this.props.role;
        this.state = {
            checkedKeys: menus
        };
    }
    // 返回menus 给父组件提供读取最新数据的方法
    getMenus = () => this.state.checkedKeys;
    getTreeNode = (menuList) => {
        // 该处的return是业务要求必须返回，否则无法取值
       return menuList.reduce((pre, item) => {
            pre.push(
                <TreeNode title={item.title} key={item.key}>
                    {item.children ? this.getTreeNode(item.children) : null}
                </TreeNode>
            );
            return pre;// 此处return是reduce的语法要求
        },[]);
    };
    // 选中某个node时的回调
    onCheck = checkedKeys => {
        // console.log('onCheck', checkedKeys);
        this.setState({ checkedKeys });
    };
    // 初始显示不会调用，只有更新时才会调用--用于显示用户切换时权限的更新
    /**
     * 接收到新的属性在render之前调用
     * @param nextProps
     * @param nextContext
     */
    componentWillReceiveProps(nextProps, nextContext) {
        const {menus} = nextProps.role;
        this.setState({
            checkedKeys: menus
        })
    }

    componentWillMount() {
        this.treeNode = this.getTreeNode(menuList);
    }

    render() {
        const {role} = this.props;
        const {checkedKeys} = this.state;
        // Item的布局
        const formItemLayout = {
            labelCol: { span: 4 },// label左侧的宽度
            wrapperCol: { span: 20 },// 右侧包裹input的宽度
        };
        return (
            <div>
                <Item label='角色名称' {...formItemLayout}>
                    <Input value={role.name} disabled/>
                </Item>
                <Tree
                    checkable
                    defaultExpandAll={true}
                    checkedKeys={checkedKeys}/*选中复选框的树节点，数据类型是数组*/
                    onCheck={this.onCheck} /*点击复选框触发的回调函数*/
                >
                    <TreeNode title="平台权限" key="auth" >
                        {this.treeNode}
                    </TreeNode>
                </Tree>
            </div>
        )
    }
}