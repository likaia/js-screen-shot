# js-web-screen-shot · [![npm](https://img.shields.io/badge/npm-v1.4.0-2081C1)](https://www.npmjs.com/package/js-web-screen-shot) [![yarn](https://img.shields.io/badge/yarn-v1.4.0-F37E42)](https://yarnpkg.com/package/js-web-screen-shot) [![github](https://img.shields.io/badge/GitHub-depositary-9A9A9A)](https://github.com/likaia/js-screen-shot) [![](https://img.shields.io/github/issues/likaia/js-screen-shot)](https://github.com/likaia/js-screen-shot/issues) [![](	https://img.shields.io/github/forks/likaia/js-screen-shot)](``https://github.com/likaia/js-screen-shot/network/members) [![](	https://img.shields.io/github/stars/likaia/js-screen-shot)](https://github.com/likaia/js-screen-shot/stargazers)
web端自定义截屏插件(原生JS版)，运行视频：[实现web端自定义截屏功能](https://www.bilibili.com/video/BV1Ey4y127cV) ,效果图如下：![截屏效果图](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/486d810877a24582aa8cf110e643c138~tplv-k3u1fbpfcp-watermark.image)

## 写在前面
关于此插件的更多介绍以及实现原理请移步：
- [实现Web端自定义截屏](https://juejin.cn/post/6924368956950052877)
- [实现Web端自定义截屏(JS版)](https://juejin.cn/post/6931901091445473293)

## 插件安装
```bash
yarn add js-web-screen-shot

# or

npm install js-web-screen-shot --save
```

## 插件使用
由于插件采用原生js编写且不依赖任何第三方库，因此它可以在任意一台支持js的设备上运行。
### import形式使用插件
* 在需要使用截屏插件的业务代码中导入插件
```javascript
import ScreenShort from "js-web-screen-shot";
```
* 在业务代码中使用时实例化插件即可
```javascript
new ScreenShort();
```
> ⚠️注意：实例化插件时一定要等dom加载完成，否则插件无法正常工作。
### cdn形式使用插件
* 将插件的`dist`文件夹复制到你的项目中
* 使用`script`标签引入dist目录下的`screenShotPlugin.umd.js`文件
```javascript
<script src="./screenShotPlugin.umd.js"></script>
```
* 在业务代码中使用时实例化插件即可
```javascript
    // 截图确认按钮回调函数
    const callback = (base64) =>{
      console.log(base64);
    }
    // 截图取消时的回调函数
    const closeFn = ()=>{
      console.log("截图窗口关闭");
    }
    new screenShotPlugin({enableWebRtc: true, completeCallback: callback,closeCallback: closeFn});
```
> ⚠️注意：实例化插件时一定要等dom加载完成，否则插件无法正常工作。

### 参数说明
截图插件有一个可选参数，它接受一个对象，对象每个key的作用如下:
* `enableWebRtc` 是否启用webrtc，值为`boolean`类型，值为`false`则使用`html2canvas`来截图
* `completeCallback` 截图完成回调函数，值为`Function`类型，最右侧的对号图标点击后会将图片的base64地址回传给你定义的函数，如果不传的话则会将图片的base64地址放到`sessionStorage`中，你可以通过下述方式拿到他：
```javascript
sessionStorage.getItem("screenShotImg");
```
* `closeCallback` 截图关闭回调函数，值为`Function`类型。
* `triggerCallback` 截图响应回调函数，值为`Function`类型，使用html2canvas截屏时，页面图片过多时响应会较慢，该函数为响应完成后触发的事件。回调函数返回一个对象，类型为: `{code: number,msg: string}`，code为0时代表截图加载完成。
* `cancelCallback` 取消分享回到函数，值为`Function`类型，使用webrtc模式截屏时，用户点了取消或者浏览器不支持时所触发的事件。回调函数返回一个对象，类型为：`{code: number,msg: string}`，code为-1时代表用户未授权或者浏览器不支持webrtc。
* `level` 截图容器层级，值为number类型。 
* `canvasWidth` 画布宽度，值为number类型。
* `canvasHeight` 画布高度，值为number类型。
* `position` 截图容器位置，值为`{left?: number, top?: number}`类型
* `clickCutFullScreen` 单击截全屏启用状态,值为`boolean`类型， 默认为`false`

### API文档
插件暴露了一些内部变量出来，便于调用者根据自己的需求进行修改。

#### getCanvasController
该函数用于获取截图容器的DOM，返回值为`HTMLCanvasElement`类型。

示例代码：

```javascript
import ScreenShort from "js-web-screen-shot";

const screenShotHandler = new ScreenShort();
const canvasDom = screenShotHandler.getCanvasController();
```
> 注意：如果截图容器尚未加载完毕，获取到的内容可能为null。



### 工具栏图标定制
如果你需要修改截图工具栏的图标，可以通过覆盖元素css类名的方式实现，插件内所有图标的css类名如下所示
> 注意：下述所有列举的图标还包含点击后的图标样式，它的写法为`.xxx-active {}`，例如：`.square-active {}`

#### square 矩形绘制图标
```scss
  .square {
    background-image: url("你的图标路径") !important;
    
    &:hover {
      background-image: url("你的图标路径") !important;
    }
    
    &:active {
      background-image: url("你的图标路径") !important;
    }
 }
```

#### round 圆型绘制图标
```scss
  .round {
    background-image: url("你的图标路径") !important;
    

    &:hover {
      background-image: url("你的图标路径") !important;
    }

    &:active {
      background-image: url("你的图标路径") !important;
    }
  }
```

#### right-top 箭头绘制图标
```scss
  .right-top {
    background-image: url("你的图标路径") !important;
    

    &:hover {
      background-image: url("你的图标路径") !important;
    }

    &:active {
      background-image: url("你的图标路径") !important;
    }
  }
```

#### brush 画笔工具
```scss 
  .brush {
    background-image: url("你的图标路径") !important;

    &:hover {
      background-image: url("你的图标路径") !important;
    }

    &:active {
      background-image: url("你的图标路径") !important;
    }
  }
  
  // 画笔尺寸选择
  // 分为3种尺寸：small、medium、big
  // 此处只列举small尺寸的写法，其它两种只需要替换brush-xxx即可
  .brush-small {
    
    background-image: url("你的图标路径") !important;

    &:hover {
      background-image: url("你的图标路径") !important;
    }
    &:active {
      background-image: url("你的图标路径") !important;
    }
  }
```

#### mosaicPen 马赛克工具
```scss
  .mosaicPen {
    background-image: url("你的图标路径") !important;
    

    &:hover {
      background-image: url("你的图标路径") !important;
    }

    &:active {
      background-image: url("你的图标路径") !important;
    }
  }
```

#### text 文本工具
```scss
  .text {
    background-image: url("你的图标路径") !important;
    

    &:hover {
      background-image: url("你的图标路径") !important;
    }

    &:active {
      background-image: url("你的图标路径") !important;
    }
  }
```

#### save 保存
```scss
  .save {
    background-image: url("你的图标路径") !important;
    

    &:hover {
      background-image: url("你的图标路径") !important;
    }

    &:active {
      background-image: url("你的图标路径") !important;
    }
  }
```

#### close 关闭
```scss
  .close {
    background-image: url("你的图标路径") !important;
    

    &:hover {
      background-image: url("你的图标路径") !important;
    }
  }
```

#### undo 撤销
```scss
  .undo {
    
    background-image: url("你的图标路径") !important;
  
    &:hover{
      background-image: url("你的图标路径") !important;
    }
  }
  // 禁用状态图标
  .undo-disabled {
    
    background-image: url("你的图标路径") !important;
  }
```

#### confirm 确认
```scss
  .confirm {
    background-image: url("你的图标路径") !important;
    

    &:hover {
      background-image: url("你的图标路径") !important;
    }
  }
```

## 写在最后
至此，插件的所有使用方法就介绍完了，该插件的Vue3版本，请移步：[vue-web-screen-shot](https://www.npmjs.com/package/vue-web-screen-shot)
