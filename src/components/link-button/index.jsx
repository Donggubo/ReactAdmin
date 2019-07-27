import React from "react";
import './index.less'
// 公共组件，用于将按钮作为类似连接的作用使用
export default function LinkButton(props) {
    return (<button {...props} className='link-button'/>);
}