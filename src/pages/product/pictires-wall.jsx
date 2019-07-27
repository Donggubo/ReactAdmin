import React, {Component} from "react";

import { Upload, Icon, Modal, message } from 'antd';
import {reqDeleteImg} from "../../api";
import PropTypes from "prop-types";
import {BASE_IMG_URL} from "../../utils/constants";
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

export default class PicturesWall extends Component {
    // 接收父组件传递的imgs数组
    static propTypes = {
        imgs: PropTypes.array
    };
    constructor(props){// 在构造函数中初始化数据
        super(props);
        let {imgs} = this.props;// 获取父组件传递的imgs
        let fileList = [];
        if(imgs && imgs.length > 0){// 判断是否为更新操作
            fileList = imgs.map((img, index) => ({// 如果为更新操作，组织出fileList
                uid: -index,
                name: img,
                status: "done",
                url: img ? BASE_IMG_URL + img : ""
            }));
        }
        // 构造函数中初始化状态如下
        this.state = {
            previewVisible: false,
            previewImage: '',
            fileList
        };
    }
    state = {
        previewVisible: false,// 是否显示大图
        previewImage: '',// 大图的src地址
        // 缩略图数组，包含了四个参数，在handleChange中按照fileList中元素格式和已上传图片的数据组织出fileList所需数据
        fileList: [
            /*{ // 完成fileList的数据组织后将例子注释
                uid: '-1',// 图片对象id
                name: 'xxx.png', // 图片名称
                status: 'done', // 图片上传状态 状态有：uploading done error removed
                url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',// 图片url地址
            },*/
        ],
    };
    // 关闭大图预览
    handleCancel = () => this.setState({ previewVisible: false });
    // 查看图片的大图的方法
    handlePreview = async file => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        this.setState({
            previewImage: file.url || file.preview, // file.preview是图片的base64地址
            previewVisible: true, // 显示大图
        });
    };
    /*
    文件状态改变的回调，返回为：
        {
            file: {},
            fileList: [ ],
            event: { },
        }
    */
    /*上传图片时触发的函数*/
    handleChange = async ({file, fileList}) => {
        // console.log(file);
        /* file的数据格式
        lastModified: 1557839460350
        lastModifiedDate: Tue May 14 2019 22:11:00 GMT+0900 (日本标准时间) {}
        name: "test.jpg"
        originFileObj: File {uid: "rc-upload-1563177077644-2", name: "test.jpg", lastModified: 1557839460350, lastModifiedDate: Tue May 14 2019 22:11:00 GMT+0900 (日本标准时间), webkitRelativePath: "", …}
        percent: 100
        response:
            data: {name: "image-1563177089976.jpg", url: "http://localhost:5000/upload/image-1563177089976.jpg"}
            status: 0
        __proto__: Object
        size: 11531
        status: "done"
        thumbUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgA"
        type: "image/jpeg"
        uid: "rc-upload-1563177077644-2"
        */
        // console.log(fileList[fileList.length-1]);
        // console.log(fileList);
        // console.log(file ===  fileList[fileList.length-1]);
        /* fileList数据格式
        fileList: [
            {
                uid: '-1',// 图片对象id
                name: 'xxx.png', // 图片名称
                status: 'done', // 图片上传状态 状态有：uploading done error removed
                url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',// 图片url地址
            },
        ],
        */
        /*根据file的数据组织出fileList中元素所需要的数据格式*/
        if (file.status === "done") {// 表示图片上传完成
            const result = file.response;
            if (result.status === 0) {
                message.success("图片上传成功");
                const {name, url} = result.data;
                file = fileList[fileList.length - 1];// fileList中的fileList[fileList.length-1]元素和file表示的文件是一样的，但是如果只改file，fileList[fileList.length-1]的值并不会发生变化，console.log(file ===  fileList[fileList.length-1]);有false表示并不指向同一个对象，因此该处使用file = fileList[fileList.length-1];此时就能真正的更新fileList
                file.name = name;// 将file的name: "test.jpg"变为response中data的name
                console.log(name);
                file.url = url; // 给file添加新属性url，将response中data的url赋值给file的url属性
            } else {
                message.error("图片上传失败");
            }
        } else if (file.status === "removed") {// 表示删除图片
            const result = await reqDeleteImg(file.name);// 不能使用fileList[fileList.length - 1].name，因为fileList是删除后的数据
            if(result.status === 0){
                message.success("图片删除成功");
            }else{
                message.error("图片删除失败");
            }
        }
        this.setState({fileList})
    };
    // 收集图片名称的方法，用于点击提交按钮发送给后台
    getImgs = () => {
        return this.state.fileList.map(file => file.name);
    };
    render() {
        const { previewVisible, previewImage, fileList } = this.state;
        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">Upload</div>
            </div>
        );
        return (
            <div>
                <Upload
                    action="/manage/img/upload"// 上传图片的接口地址
                    listType="picture-card" // 图片的显示类型
                    accept="image/*" // 接收文件的类型
                    name="image" // 发送到后台的文件参数名--按照接口需要指定name为image
                    fileList={fileList} // 所有已上传图片文件的对象数组，上传完成后需要将图片信息保存到数据库
                    onPreview={this.handlePreview} // 显示大图的函数
                    onChange={this.handleChange}
                >
                    {fileList.length >= 3 ? null : uploadButton}
                </Upload>
                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                    <img alt="img" style={{ width: '100%' }} src={previewImage} />
                </Modal>
            </div>
        );
    }
}