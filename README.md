# js-web-screen-shot · [![npm](https://img.shields.io/badge/npm-v1.7.8-2081C1)](https://www.npmjs.com/package/js-web-screen-shot) [![yarn](https://img.shields.io/badge/yarn-v1.7.8-F37E42)](https://yarnpkg.com/package/js-web-screen-shot) [![github](https://img.shields.io/badge/GitHub-depositary-9A9A9A)](https://github.com/likaia/js-screen-shot) [![](https://img.shields.io/github/issues/likaia/js-screen-shot)](https://github.com/likaia/js-screen-shot/issues) [![](	https://img.shields.io/github/forks/likaia/js-screen-shot)](``https://github.com/likaia/js-screen-shot/network/members) [![](	https://img.shields.io/github/stars/likaia/js-screen-shot)](https://github.com/likaia/js-screen-shot/stargazers)
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
> 注意⚠️： 如果需要使用插件的webrtc模式或者截图写入剪切板功能，需要你的网站运行在`https`环境或者`localhost`环境。
### import形式使用插件
* 在需要使用截屏插件的业务代码中导入插件
```javascript
import ScreenShot from "js-web-screen-shot";
```
* 在业务代码中使用时实例化插件即可
```javascript
new ScreenShot();
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
* `triggerCallback` 截图响应回调函数，值为`Function`类型，使用html2canvas截屏时，页面图片过多时响应会较慢；使用webrtc截屏时用户点了分享，该函数为响应完成后触发的事件。回调函数返回一个对象，类型为: `{code: number,msg: string}`，code为0时代表截图加载完成。
* `cancelCallback` 取消分享回到函数，值为`Function`类型，使用webrtc模式截屏时，用户点了取消或者浏览器不支持时所触发的事件。回调函数返回一个对象，类型为：`{code: number,msg: string}`，code为-1时代表用户未授权或者浏览器不支持webrtc。
* `level` 截图容器层级，值为number类型。 
* `canvasWidth` 画布宽度，值为number类型，必须与高度一起设置，单独设置无效。
* `canvasHeight` 画布高度，值为number类型，必须与宽度一起设置，单独设置无效。
* `position` 截图容器位置，值为`{left?: number, top?: number}`类型
* `clickCutFullScreen` 单击截全屏启用状态,值为`boolean`类型， 默认为`false`
* `hiddenToolIco` 需要隐藏的截图工具栏图标，值为`{ save?: boolean; undo?: boolean; confirm?: boolean }`类型，默认为`{}`。传你需要隐藏的图标名称，将值设为`true`即可。
* `showScreenData` 截图组件加载完毕后，是否显示截图内容至canvas画布内，值为`boolean`类型，默认为`false`。
* `imgSrc` 截图内容，如果你已经通过其他方式获取到了屏幕内容（例如`electron`环境），那么可以将获取到的内容传入，此时插件将使用你传进来的图片，值为`string`类型（可以为图片`url`地址或者`base64`），默认为`null`。
* `loadCrossImg` 是否加载跨域图片，值为`boolean`类型，默认为`false`。
* `screenShotDom` 需要进行截图的容器，值为`HTMLElement`类型，默认使用的是`body`。
* `cropBoxInfo` 初始裁剪框，值为`{ x: number; y: number; w: number; h: number }`类型，默认不加载。
* `wrcReplyTime` webrtc模式捕捉屏幕时的响应时间，值为`number`类型，默认为500ms。
* `noScroll` 截图容器是否可滚动，值为`boolean`类型，默认为`true`。

> 上述类型中的`?:`为ts中的可选类型，意思为：这个key是可选的，如果需要就传，不需要就不传。

> imgSrc是url时，如果图片资源跨域了，必须让图片服务器允许跨域才能正常加载。同样的loadCrossImg设置为true时，图片资源跨域了也需要让图片服务器允许跨域。

### 快捷键监听
插件容器监听了三个快捷键，如下所示：
* `Esc`，按下键盘上的esc键时，等同于点了工具栏的关闭图标。
* `Enter`，按下键盘上的enter键时，等同于点了截图工具栏的确认图标。
* `Ctrl/Command + z`，按下这两个组合键时，等同于点了截图工具栏的撤销图标。


### 额外提供的API
插件暴露了一些内部变量出来，便于调用者根据自己的需求进行修改。

#### getCanvasController
该函数用于获取截图容器的DOM，返回值为`HTMLCanvasElement`类型。

示例代码：

```javascript
import ScreenShot from "js-web-screen-shot";

const screenShotHandler = new ScreenShot();
const canvasDom = screenShotHandler.getCanvasController();
```
> 注意：如果截图容器尚未加载完毕，获取到的内容可能为null。



### 工具栏图标定制
如果你需要修改截图工具栏的图标，可以通过覆盖元素css类名的方式实现，插件内所有图标的css类名如下所示：
* square 矩形绘制图标
* round 圆型绘制图标
* right-top 箭头绘制图标
* brush 画笔工具
* mosaicPen 马赛克工具
* text 文本工具
* save 保存
* close 关闭
* undo 撤销
* confirm 确认

以`square`为例，要修改它的图标，只需要将下述代码添加进你项目代码的样式中即可。
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


## 写在最后
至此，插件的所有使用方法就介绍完了，该插件的Vue3版本，请移步：[vue-web-screen-shot](https://www.npmjs.com/package/vue-web-screen-shot)
