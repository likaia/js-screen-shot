# js-web-screen-shot · [![npm](https://img.shields.io/badge/npm-v1.1.0-2081C1)](https://www.npmjs.com/package/js-web-screen-shot) [![yarn](https://img.shields.io/badge/yarn-v1.1.0-F37E42)](https://yarnpkg.com/package/js-web-screen-shot) [![github](https://img.shields.io/badge/GitHub-depositary-9A9A9A)](https://github.com/likaia/js-screen-shot) [![](https://img.shields.io/github/issues/likaia/js-screen-shot)](https://github.com/likaia/js-screen-shot/issues) [![](	https://img.shields.io/github/forks/likaia/js-screen-shot)](https://github.com/likaia/js-screen-shot/network/members) [![](	https://img.shields.io/github/stars/likaia/js-screen-shot)](https://github.com/likaia/js-screen-shot/stargazers)
web端自定义截屏插件(原生JS版)，运行视频：[实现web端自定义截屏功能](https://www.bilibili.com/video/BV1Ey4y127cV) ,效果图如下：![截屏效果图](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/486d810877a24582aa8cf110e643c138~tplv-k3u1fbpfcp-watermark.image)

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
new screenShotPlugin();
```
> ⚠️注意：实例化插件时一定要等dom加载完成，否则插件无法正常工作。

### 参数说明
截图工具栏中最右侧的对号图标，点击后会把当前裁剪区域的内容以`base64`形式放入`sessionStorage`中，可以通过下述方式拿到它：
```javascript
sessionStorage.getItem("screenShotImg");
```

## 写在最后
至此，插件的所有使用方法就介绍完了，该插件的Vue3版本，请移步：[vue-web-screen-shot](https://www.npmjs.com/package/vue-web-screen-shot)