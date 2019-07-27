import React, { Component } from 'react';
import { EditorState, convertToRaw, ContentState } from 'draft-js';// 需要引入ContentState
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';// 富文本编辑器样式
import PropTypes from 'prop-types';

export default class EditorConvertToHTML extends Component {
    static propTypes = {// 获取父组件传递的detail信息，用于修改时显示
        detail: PropTypes.string
    };
    state = {
        editorState: EditorState.createEmpty(),
    };
    // 在构造函数中根据原有的标签字符串将内容显示到文本中
    constructor(props) {
        super(props);
        const html = this.props.detail;
        if (html) {
            const contentBlock = htmlToDraft(html);
            if (contentBlock) {
                const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                const editorState = EditorState.createWithContent(contentState);
                this.state = {
                    editorState,
                };
            }
        }else{
           this.state = {// 构造函数中初始化state状态--this.state = {}
               editorState: EditorState.createEmpty()
           }
        }
    }
    onEditorStateChange = (editorState) => {
        this.setState({
            editorState,
        });
    };
    // 定义返回带标签的字符串，用于在父组件中调用该方法获取字符串用于提交
    getDetail = () => {
        return draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()));//这里是state中的editorState
    };
    // 富文本编辑框的图片上传
    uploadImageCallBack = (file) => {
        return new Promise(
            (resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/manage/img/upload');// 图片上传地址
                const data = new FormData();
                data.append('image', file);
                xhr.send(data);
                xhr.addEventListener('load', () => {
                    const response = JSON.parse(xhr.responseText);
                    const url = response.data.url;// 获取图片上传成功服务器返回的url地址
                    resolve({data: {link: url}});// 返回的数据
                });
                xhr.addEventListener('error', () => {
                    const error = JSON.parse(xhr.responseText);
                    reject(error);
                });
            }
        );
    };
    render() {
        const { editorState } = this.state;// 从state中获取editorState
        return (
            <div>
                <Editor
                    editorState={editorState}
                    editorStyle={{border: '1px solid black', minHeight: 300, paddingLeft: 10}}/*指定样式--编辑框的边框和高度*/
                    onEditorStateChange={this.onEditorStateChange}
                    // 用于图片上传
                    toolbar={{
                        image: { uploadCallback: this.uploadImageCallBack, alt: { present: true, mandatory: true} },
                    }}
                />
                {/*预览文本*/}
                <textarea
                    disabled
                    style={{border: '1px solid black', minHeight: 50, paddingLeft: 10, minWidth: 883}}
                    value={draftToHtml(convertToRaw(editorState.getCurrentContent()))}
                />
            </div>
        );
    }
}