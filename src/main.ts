import CreateDom from "@/lib/main-entrance/CreateDom";
// 导入截图所需样式
import "@/assets/scss/screen-shot.scss";
import InitData from "@/lib/main-entrance/InitData";
import {
  crcEventType,
  cutOutBoxBorder,
  drawCutOutBoxReturnType,
  movePositionType,
  positionInfoType,
  screenShotType,
  toolPositionValType,
  zoomCutOutBoxReturnType
} from "@/lib/type/ComponentType";
import { drawMasking } from "@/lib/split-methods/DrawMasking";
import { fixedData, nonNegativeData } from "@/lib/common-methods/FixedData";
import { drawPencil, initPencil } from "@/lib/split-methods/DrawPencil";
import { drawText } from "@/lib/split-methods/DrawText";
import { drawRectangle } from "@/lib/split-methods/DrawRectangle";
import { drawCircle } from "@/lib/split-methods/DrawCircle";
import { DrawArrow } from "@/lib/split-methods/DrawArrow";
import { drawMosaic } from "@/lib/split-methods/DrawMosaic";
import { drawCutOutBox } from "@/lib/split-methods/DrawCutOutBox";
import { zoomCutOutBoxPosition } from "@/lib/common-methods/ZoomCutOutBoxPosition";
import { saveBorderArrInfo } from "@/lib/common-methods/SaveBorderArrInfo";
import { calculateToolLocation } from "@/lib/split-methods/CalculateToolLocation";
import html2canvas from "html2canvas";
import PlugInParameters from "@/lib/main-entrance/PlugInParameters";
import { getDrawBoundaryStatus } from "@/lib/split-methods/BoundaryJudgment";
import KeyboardEventHandle from "@/lib/split-methods/KeyboardEventHandle";
import { setPlugInParameters } from "@/lib/split-methods/SetPlugInParameters";
import { drawCrossImg } from "@/lib/split-methods/drawCrossImg";
import { getCanvas2dCtx } from "@/lib/common-methods/CanvasPatch";
import { updateContainerMouseStyle } from "@/lib/common-methods/UpdateContainerMouseStyle";
import { addHistory } from "@/lib/split-methods/AddHistoryData";
import { isPC, isTouchDevice } from "@/lib/common-methods/DeviceTypeVerif";
import { drawLineArrow } from "@/lib/split-methods/DrawLineArrow";

export default class ScreenShot {
  // 当前实例的响应式data数据
  private readonly data: InitData;

  // video容器用于存放屏幕MediaStream流
  private readonly videoController: HTMLVideoElement;
  // 截图区域canvas容器
  private screenShotContainer: HTMLCanvasElement | null | undefined;
  private screenShotDom:
    | HTMLElement
    | HTMLDivElement
    | HTMLCanvasElement
    | null = null;
  // 截图工具栏dom
  private toolController: HTMLDivElement | null | undefined;
  // 截图图片存放容器
  private screenShotImageController: HTMLCanvasElement;
  // 截图区域画布
  private screenShotCanvas: CanvasRenderingContext2D | undefined;
  // 文本区域dom
  private textInputController: HTMLDivElement | null | undefined;
  // 截图工具栏画笔选项dom
  private optionController: HTMLDivElement | null | undefined;
  private optionIcoController: HTMLDivElement | null | undefined;
  private cutBoxSizeContainer: HTMLDivElement | null | undefined;
  private plugInParameters: PlugInParameters;
  private wrcReplyTime = 500;
  private keyboardEventHandle: null | KeyboardEventHandle = null;
  // 图形位置参数
  private drawGraphPosition: positionInfoType = {
    startX: 0,
    startY: 0,
    width: 0,
    height: 0
  };
  // 临时图形位置参数
  private tempGraphPosition: positionInfoType = {
    startX: 0,
    startY: 0,
    width: 0,
    height: 0
  };
  private wrcImgPosition = { x: 0, y: 0, w: 0, h: 0 };
  // 是否隐藏页面滚动条
  private hiddenScrollBar = {
    color: "#000000",
    fillState: false,
    state: false,
    fillWidth: 0,
    fillHeight: 0
  };
  private wrcWindowMode = false;
  // 裁剪框边框节点坐标事件
  private cutOutBoxBorderArr: Array<cutOutBoxBorder> = [];
  // 当前操作的边框节点
  private borderOption: number | null = null;

  // 点击裁剪框时的鼠标坐标
  private movePosition: movePositionType = {
    moveStartX: 0,
    moveStartY: 0
  };

  // 鼠标拖动状态
  private dragFlag = false;
  // 单击截取屏启用状态
  private clickCutFullScreen = false;
  // 全屏截取状态
  private getFullScreenStatus = false;
  // 上一个裁剪框坐标信息
  private drawGraphPrevX = 0;
  private drawGraphPrevY = 0;
  // 马赛克涂抹区域大小
  private degreeOfBlur = 5;
  private dpr = window.devicePixelRatio || 1;
  // 截全屏时工具栏展示的位置要减去的高度
  private fullScreenDiffHeight = 60;
  // 截图容器位置信息
  private position: { top: number; left: number } = { left: 0, top: 0 };
  private imgSrc: string | null = null;
  private loadCrossImg = false;
  // 鼠标是否在裁剪框内
  private mouseInsideCropBox = false;
  private proxyUrl: undefined | string = undefined;
  private useCORS = false;
  private drawStatus = false;
  // webrtc模式下的屏幕流数据
  private captureStream: MediaStream | null = null;
  private cropBoxInfo: {
    x: number;
    y: number;
    w: number;
    h: number;
  } | null = null;

  // 文本输入框位置
  private textInputPosition: { mouseX: number; mouseY: number } = {
    mouseX: 0,
    mouseY: 0
  };
  // 工具栏显示位置
  private placement: toolPositionValType = "center";
  // 递增变粗箭头的实现
  private drawArrow = new DrawArrow();
  private customRightClickEvent: crcEventType = {
    state: false
  };

  constructor(options: screenShotType) {
    this.plugInParameters = new PlugInParameters();
    // 提取options中的有用参数设置到全局参数中
    setPlugInParameters(options);
    // 创建截图所需dom并设置回调函数
    new CreateDom(options);
    // 创建并获取webrtc模式所需要的辅助dom
    this.videoController = document.createElement("video");
    this.videoController.autoplay = true;
    this.screenShotImageController = document.createElement("canvas");
    // 实例化响应式data
    this.data = new InitData();

    // 设置插件的可选参数
    this.setOptionalParameter(options);
    // 获取截图区域canvas容器(获取的同时也会为InitData中的全局变量赋值)
    this.setGlobalParameter();
    // 修改截图容器可滚动状态
    this.data.setNoScrollStatus(options?.noScroll);

    // 加载截图组件
    this.load(options?.triggerCallback, options?.cancelCallback);
    if (
      this.toolController == null ||
      this.screenShotContainer == null ||
      this.textInputController == null
    ) {
      return;
    }
    // 截图组件加载完毕后，对层级进行调整
    this.adjustContainerLevels(options?.level ? options.level : 0);

    // 创建键盘事件监听
    this.keyboardEventHandle = new KeyboardEventHandle(
      this.screenShotContainer,
      this.toolController
    );
    // 给输入容器设置快捷键监听
    this.registerContainerShortcuts(this.textInputController);
    if (this.customRightClickEvent.state) {
      // 给截图容器添加右键事件监听
      this.registerForRightClickEvent(this.screenShotContainer);
    }
  }

  // 获取截图区域canvas容器
  public getCanvasController(): HTMLCanvasElement | null | undefined {
    return this.screenShotContainer;
  }

  // 销毁组件方法
  public destroyComponents(): void {
    this.data.destroyDOM();
    this.data.setInitStatus(true);
  }

  // 确认截图方法
  public completeScreenshot() {
    if (this.keyboardEventHandle) {
      this.keyboardEventHandle.triggerEvent("confirm");
    }
  }

  // 注册右键事件
  private registerForRightClickEvent(container: HTMLElement) {
    container.addEventListener("contextmenu", e => {
      e.preventDefault();
      // 调用者传入了自定义事件则执行
      if (this.customRightClickEvent.handleFn) {
        this.customRightClickEvent.handleFn();
        return;
      }
      // 销毁组件
      this.destroyComponents();
    });
  }

  // 加载截图组件
  private load(
    triggerCallback: Function | undefined,
    cancelCallback: Function | undefined
  ) {
    const canvasSize = this.plugInParameters.getCanvasSize();
    const viewSize = {
      width: parseFloat(window.getComputedStyle(document.body).width),
      height: parseFloat(window.getComputedStyle(document.body).height)
    };
    // 设置截图区域canvas宽高
    this.data.setScreenShotInfo(viewSize.width, viewSize.height);
    // 设置截图容器位置
    this.data.setScreenShotPosition(this.position.left, this.position.top);
    // 设置截图图片存放容器宽高
    this.screenShotImageController.width = viewSize.width;
    this.screenShotImageController.height = viewSize.height;
    // 用户有传宽高则使用用户传进来的
    if (canvasSize.canvasWidth !== 0 && canvasSize.canvasHeight !== 0) {
      this.data.setScreenShotInfo(
        canvasSize.canvasWidth,
        canvasSize.canvasHeight
      );
      this.screenShotImageController.width = canvasSize.canvasWidth;
      this.screenShotImageController.height = canvasSize.canvasHeight;
    }
    // 获取截图区域canvas容器画布
    if (this.screenShotContainer == null) return;
    const context = getCanvas2dCtx(
      this.screenShotContainer,
      this.screenShotImageController.width,
      this.screenShotImageController.height
    );
    if (context == null) return;
    // 显示截图区域容器
    this.data.showScreenShotPanel();
    if (!this.plugInParameters.getWebRtcStatus()) {
      // 判断用户是否自己传入截屏图片
      if (this.imgSrc != null) {
        this.drawPictures(triggerCallback, context, this.imgSrc);
        return;
      }

      // html2canvas截屏
      html2canvas(this.screenShotDom ? this.screenShotDom : document.body, {
        onclone: this.loadCrossImg ? drawCrossImg : undefined,
        proxy: this.proxyUrl,
        useCORS: this.useCORS
      })
        .then(canvas => {
          // 装载截图的dom为null则退出
          if (this.screenShotContainer == null) return;

          // 存储html2canvas截取的内容
          this.screenShotImageController = canvas;
          // 初始化截图容器
          this.initScreenShot(triggerCallback, context, canvas);
        })
        .catch(err => {
          if (triggerCallback != null) {
            // 获取页面元素成功，执行回调函数
            triggerCallback({ code: -1, msg: err });
          }
        });
      return;
    }
    // 调用者有传入屏幕流数据则使用
    if (this.plugInParameters.getScreenFlow()) {
      this.sendStream(
        this.plugInParameters.getScreenFlow(),
        cancelCallback,
        triggerCallback
      );
      return;
    }
    // 隐藏光标
    document.body.classList.add("no-cursor");
    // 使用webrtc实现截屏
    this.screenShot(cancelCallback, triggerCallback);
  }

  private sendStream = (
    stream: MediaStream | null,
    cancelCallback: Function | undefined,
    triggerCallback: Function | undefined
  ) => {
    if (stream instanceof MediaStream) {
      this.videoController.srcObject = stream;
      this.loadScreenFlowData(triggerCallback);
    } else {
      if (cancelCallback != null) {
        cancelCallback({
          code: -1,
          msg: "视频流接入失败"
        });
      }
      // 销毁截图组件
      this.data.destroyDOM();
      throw `视频流接入失败`;
    }
    return stream;
  };

  private loadScreenFlowData(triggerCallback: Function | undefined) {
    setTimeout(() => {
      // 获取截图区域canvas容器画布
      if (this.screenShotContainer == null) return;
      const canvasSize = this.plugInParameters.getCanvasSize();
      let containerWidth = this.screenShotImageController?.width;
      let containerHeight = this.screenShotImageController?.height;
      // 用户有传宽高时，则使用用户的
      if (canvasSize.canvasWidth !== 0 && canvasSize.canvasHeight !== 0) {
        containerWidth = canvasSize.canvasWidth;
        containerHeight = canvasSize.canvasHeight;
      }
      let imgContainerWidth = containerWidth;
      let imgContainerHeight = containerHeight;
      if (this.wrcWindowMode) {
        imgContainerWidth = containerWidth * this.dpr;
        imgContainerHeight = containerHeight * this.dpr;
      }
      const context = getCanvas2dCtx(
        this.screenShotContainer,
        containerWidth,
        containerHeight
      );
      const imgContext = getCanvas2dCtx(
        this.screenShotImageController,
        imgContainerWidth,
        imgContainerHeight
      );
      if (context == null || imgContext == null) return;
      // 赋值截图区域canvas画布
      this.screenShotCanvas = context;
      const { videoWidth, videoHeight } = this.videoController;
      if (this.wrcWindowMode) {
        // 从窗口视频流中获取body内容
        const bodyImgData = this.getWindowContentData(
          videoWidth,
          videoHeight,
          containerWidth * this.dpr,
          containerHeight * this.dpr
        );
        if (bodyImgData == null) return;
        // 将body内容绘制到图片容器里
        imgContext.putImageData(bodyImgData, 0, 0);
      } else {
        // 对webrtc源提供的图像宽高进行修复
        let fixWidth = containerWidth;
        let fixHeight = (videoHeight * containerWidth) / videoWidth;
        if (fixHeight > containerHeight) {
          fixWidth = (containerWidth * containerHeight) / fixHeight;
          fixHeight = containerHeight;
        }
        // 对视频容器的内容进行裁剪
        fixWidth = this.wrcImgPosition.w > 0 ? this.wrcImgPosition.w : fixWidth;
        fixHeight =
          this.wrcImgPosition.h > 0 ? this.wrcImgPosition.h : fixHeight;
        imgContext?.drawImage(
          this.videoController,
          this.wrcImgPosition.x,
          this.wrcImgPosition.y,
          fixWidth,
          fixHeight
        );
        // 隐藏滚动条会出现部分内容未截取到，需要进行修复
        const diffHeight = containerHeight - fixHeight;
        if (
          this.hiddenScrollBar.state &&
          diffHeight > 0 &&
          this.hiddenScrollBar.fillState
        ) {
          // 填充容器的剩余部分
          imgContext.beginPath();
          let fillWidth = containerWidth;
          let fillHeight = diffHeight;
          if (this.hiddenScrollBar.fillWidth > 0) {
            fillWidth = this.hiddenScrollBar.fillWidth;
          }
          if (this.hiddenScrollBar.fillHeight > 0) {
            fillHeight = this.hiddenScrollBar.fillHeight;
          }
          imgContext.rect(0, fixHeight, fillWidth, fillHeight);
          imgContext.fillStyle = this.hiddenScrollBar.color;
          imgContext.fill();
        }
      }

      // 初始化截图容器
      this.initScreenShot(undefined, context, this.screenShotImageController);
      let displaySurface = null;
      let displayLabel = null;
      if (this.captureStream) {
        // 获取当前选择的窗口类型
        displaySurface = this.captureStream.getVideoTracks()[0].getSettings()
          ?.displaySurface;
        // 获取当前选择的标签页标识
        displayLabel = this.captureStream.getVideoTracks()[0].label;
      }
      // 执行截图成功回调
      if (triggerCallback) {
        triggerCallback({
          code: 0,
          msg: "截图加载完成",
          displaySurface,
          displayLabel
        });
      }
      // 停止捕捉屏幕
      this.stopCapture();
      // 重置光标状态
      document.body.classList.remove("no-cursor");
    }, this.wrcReplyTime);
  }

  // 开始捕捉屏幕
  private startCapture = async (cancelCallback: Function | undefined) => {
    let captureStream = null;
    let mediaWidth = this.screenShotImageController.width * this.dpr;
    let mediaHeight = this.screenShotImageController.height * this.dpr;
    let curTabState = true;
    let displayConfig = {};
    // 窗口模式启用时则
    if (this.wrcWindowMode) {
      mediaWidth = window.screen.width * this.dpr;
      mediaHeight = window.screen.height * this.dpr;
      curTabState = false;
      displayConfig = {
        displaySurface: "window"
      };
    }

    try {
      // 捕获屏幕
      captureStream = await navigator.mediaDevices.getDisplayMedia({
        audio: false,
        video: {
          width: mediaWidth,
          height: mediaHeight,
          ...displayConfig
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        // 当前标签页
        preferCurrentTab: curTabState
      });
      // 将MediaStream输出至video标签
      this.videoController.srcObject = captureStream;
      // 储存屏幕流数据
      this.captureStream = captureStream;
    } catch (err) {
      if (cancelCallback != null) {
        cancelCallback({
          code: -1,
          msg: "浏览器不支持webrtc或者用户未授权",
          errorInfo: err
        });
      }
      // 销毁截图组件
      this.data.destroyDOM();
      throw `浏览器不支持webrtc或者用户未授权( ${err} )`;
    }
    return captureStream;
  };

  // 停止捕捉屏幕
  private stopCapture = () => {
    const srcObject = this.videoController.srcObject;
    if (srcObject && "getTracks" in srcObject) {
      const tracks = srcObject.getTracks();
      tracks.forEach(track => track.stop());
      this.videoController.srcObject = null;
    }
  };

  // 截屏
  private screenShot = (
    cancelCallback: Function | undefined,
    triggerCallback: Function | undefined
  ) => {
    // 开始捕捉屏幕
    this.startCapture(cancelCallback).then(() => {
      this.loadScreenFlowData(triggerCallback);
    });
  };

  // 鼠标按下事件
  private mouseDownEvent = (event: MouseEvent | TouchEvent) => {
    // 隐藏颜色选择面板
    this.data.setColorPanelStatus(false);
    // 隐藏文字大小选择面板
    this.data.setTextSizeOptionStatus(false);
    // 非鼠标左键按下则终止
    if (event instanceof MouseEvent && event.button != 0) return;

    // 当前处于移动端触摸时，需要在按下时判断当前坐标点是否处于裁剪框内，主动更新draggingTrim状态（移动端的move事件只会在按下时才会触发）
    if (
      isTouchDevice() &&
      event instanceof TouchEvent &&
      this.screenShotCanvas
    ) {
      this.operatingCutOutBox(
        event.touches[0].pageX,
        event.touches[0].pageY,
        this.tempGraphPosition.startX,
        this.tempGraphPosition.startY,
        this.tempGraphPosition.width,
        this.tempGraphPosition.height,
        this.screenShotCanvas
      );
    }
    // 当前操作的是撤销
    if (this.data.getToolName() == "undo") return;
    this.data.setDragging(true);
    this.drawStatus = false;
    // 重置工具栏超出状态
    this.data.setToolPositionStatus(false);
    const mouseX = nonNegativeData(
      event instanceof MouseEvent ? event.offsetX : event.touches[0].pageX
    );
    const mouseY = nonNegativeData(
      event instanceof MouseEvent ? event.offsetY : event.touches[0].pageY
    );

    // 如果当前操作的是截图工具栏
    if (this.data.getToolClickStatus()) {
      // 记录当前鼠标开始坐标
      this.drawGraphPosition.startX = mouseX;
      this.drawGraphPosition.startY = mouseY;
    }

    // 当前操作的是画笔
    if (this.data.getToolName() == "brush" && this.screenShotCanvas) {
      // 初始化画笔
      initPencil(this.screenShotCanvas, mouseX, mouseY);
    }

    // 当前操作的文本
    if (
      this.data.getToolName() == "text" &&
      this.textInputController &&
      this.screenShotContainer &&
      this.screenShotCanvas
    ) {
      if (!this.mouseInsideCropBox) {
        return;
      }
      // 显示文本输入区域
      this.data.setTextStatus(true);
      // 判断输入框位置是否变化
      if (
        this.textInputPosition.mouseX != 0 &&
        this.textInputPosition.mouseY != 0 &&
        this.textInputPosition.mouseX != mouseX &&
        this.textInputPosition.mouseY != mouseY
      ) {
        drawText(
          this.textInputController.innerText,
          this.textInputPosition.mouseX,
          this.textInputPosition.mouseY,
          this.data.getSelectedColor(),
          this.data.getFontSize(),
          this.screenShotCanvas
        );

        // 输入框内容不为空时则隐藏
        if (this.textInputController.innerText !== "") {
          // 隐藏输入框
          this.data.setTextStatus(false);
        }

        // 清空文本输入区域的内容
        this.textInputController.innerHTML = "";
        // 保存绘制记录
        addHistory();
      }
      // 计算文本框显示位置, 需要加上截图容器的位置信息
      const textMouseX = mouseX + this.position.left;
      // 设置文本框位置等信息
      this.textInputController.style.left = textMouseX + "px";
      this.textInputController.style.fontSize = this.data.getFontSize() + "px";
      this.textInputController.style.fontFamily = "none";
      this.textInputController.style.color = this.data.getSelectedColor();

      // 部分操作需要等dom渲染完毕执行
      setTimeout(() => {
        if (this.textInputController) {
          // 获取输入框容器的高度
          const containerHeight = this.textInputController.offsetHeight;
          // 输入框容器y轴的位置需要在坐标的基础上再加上容器高度的一半，容器的位置就正好居中于光标
          // canvas渲染的时候就不会出现位置不一致的问题了
          const textMouseY =
            mouseY - Math.floor(containerHeight / 2) + this.position.top;
          this.textInputController.style.top = textMouseY + "px";
          // 获取焦点
          this.textInputController.focus();
          // 记录当前输入框位置
          this.textInputPosition = { mouseX: mouseX, mouseY: mouseY };
          this.data.setTextInfo({
            positionX: mouseX,
            positionY: mouseY,
            color: this.data.getSelectedColor(),
            size: this.data.getFontSize()
          });
        }
      });
    }

    // 如果操作的是裁剪框
    if (this.borderOption) {
      // 设置为拖动状态
      this.data.setDraggingTrim(true);
      // 记录移动时的起始点坐标
      this.movePosition.moveStartX = mouseX;
      this.movePosition.moveStartY = mouseY;
    } else {
      // 保存当前裁剪框的坐标
      this.drawGraphPrevX = this.drawGraphPosition.startX;
      this.drawGraphPrevY = this.drawGraphPosition.startY;
      // 绘制裁剪框,记录当前鼠标开始坐标
      this.drawGraphPosition.startX = mouseX;
      this.drawGraphPosition.startY = mouseY;
    }
  };

  // 鼠标移动事件
  private mouseMoveEvent = (event: MouseEvent | TouchEvent) => {
    if (
      this.screenShotCanvas == null ||
      this.screenShotContainer == null ||
      this.data.getToolName() == "undo"
    ) {
      return;
    }
    // 去除默认事件
    event.preventDefault();

    // 工具栏未选择且鼠标处于按下状态时
    if (!this.data.getToolClickStatus() && this.data.getDragging()) {
      // 修改拖动状态为true;
      this.dragFlag = true;
      // 隐藏截图工具栏
      this.data.setToolStatus(false);
      // 隐藏裁剪框尺寸显示容器
      this.data.setCutBoxSizeStatus(false);
    }
    // 获取当前绘制中的工具位置信息
    const { startX, startY, width, height } = this.drawGraphPosition;
    // 获取当前鼠标坐标
    const currentX = nonNegativeData(
      event instanceof MouseEvent ? event.offsetX : event.touches[0].pageX
    );
    const currentY = nonNegativeData(
      event instanceof MouseEvent ? event.offsetY : event.touches[0].pageY
    );
    // 绘制中工具的临时宽高
    const tempWidth = currentX - startX;
    const tempHeight = currentY - startY;
    // 工具栏绘制
    if (this.data.getToolClickStatus() && this.data.getDragging()) {
      // 获取裁剪框位置信息
      const cutBoxPosition = this.data.getCutOutBoxPosition();
      // 绘制中工具的起始x、y坐标不能小于裁剪框的起始坐标
      // 绘制中工具的起始x、y坐标不能大于裁剪框的结束标作
      // 当前鼠标的x坐标不能小于裁剪框起始x坐标，不能大于裁剪框的结束坐标
      // 当前鼠标的y坐标不能小于裁剪框起始y坐标，不能大于裁剪框的结束坐标
      if (
        !getDrawBoundaryStatus(startX, startY, cutBoxPosition) ||
        !getDrawBoundaryStatus(currentX, currentY, cutBoxPosition)
      )
        return;

      // 当前操作的不是马赛克则显示最后一次画布绘制时的状态
      if (this.data.getToolName() != "mosaicPen") {
        this.showLastHistory();
        this.drawStatus = true;
      }
      switch (this.data.getToolName()) {
        case "square":
          drawRectangle(
            startX,
            startY,
            tempWidth,
            tempHeight,
            this.data.getSelectedColor(),
            this.data.getPenSize(),
            this.screenShotCanvas
          );
          break;
        case "round":
          drawCircle(
            this.screenShotCanvas,
            currentX,
            currentY,
            startX,
            startY,
            this.data.getPenSize(),
            this.data.getSelectedColor()
          );
          break;
        case "right-top":
          // 绘制等比例箭头
          if (this.plugInParameters.getRatioArrow()) {
            drawLineArrow(
              this.screenShotCanvas,
              startX,
              startY,
              currentX,
              currentY,
              30,
              10,
              this.data.getPenSize(),
              this.data.getSelectedColor()
            );
            return;
          }
          this.drawArrow.draw(
            this.screenShotCanvas,
            startX,
            startY,
            currentX,
            currentY,
            this.data.getSelectedColor(),
            this.data.getPenSize()
          );
          break;
        case "brush":
          // 画笔绘制
          drawPencil(
            this.screenShotCanvas,
            currentX,
            currentY,
            this.data.getPenSize(),
            this.data.getSelectedColor()
          );
          break;
        case "mosaicPen":
          // 当前为马赛克工具则修改绘制状态
          // 前面做了判断，此处需要特殊处理
          if (!this.drawStatus) {
            this.showLastHistory();
            this.drawStatus = true;
          }
          // 绘制马赛克，为了确保鼠标位置在绘制区域中间，所以对x、y坐标进行-10处理
          drawMosaic(
            currentX - 10,
            currentY - 10,
            this.data.getMosaicPenSize(),
            this.degreeOfBlur,
            this.screenShotCanvas
          );
          break;
        default:
          break;
      }
      return;
    }
    // 执行裁剪框操作函数
    this.operatingCutOutBox(
      currentX,
      currentY,
      startX,
      startY,
      width,
      height,
      this.screenShotCanvas
    );
    // 如果鼠标未点击或者当前操作的是裁剪框都return
    if (!this.data.getDragging() || this.data.getDraggingTrim()) return;
    // 绘制裁剪框
    this.tempGraphPosition = drawCutOutBox(
      startX,
      startY,
      tempWidth,
      tempHeight,
      this.screenShotCanvas,
      this.data.getBorderSize(),
      this.screenShotContainer,
      this.screenShotImageController
    ) as drawCutOutBoxReturnType;
  };

  // 调整插件容器层级
  private adjustContainerLevels(level: number): void {
    if (
      this.screenShotContainer == null ||
      this.toolController == null ||
      this.textInputController == null ||
      this.optionIcoController == null ||
      this.optionController == null ||
      this.cutBoxSizeContainer == null ||
      level <= 0
    ) {
      return;
    }
    this.screenShotContainer.style.zIndex = `${level}`;
    this.toolController.style.zIndex = `${level + 1}`;
    this.textInputController.style.zIndex = `${level + 1}`;
    this.optionIcoController.style.zIndex = `${level + 1}`;
    this.optionController.style.zIndex = `${level + 1}`;
    this.cutBoxSizeContainer.style.zIndex = `${level + 1}`;
  }

  // 初始化裁剪框
  private initCropBox(cropBoxInfo: {
    x: number;
    y: number;
    w: number;
    h: number;
  }): void {
    const startX = cropBoxInfo.x;
    const startY = cropBoxInfo.y;
    const width = cropBoxInfo.w;
    const height = cropBoxInfo.h;
    if (this.screenShotContainer == null) return;
    this.drawGraphPosition = { startX, startY, width, height };
    this.data.setCutOutBoxPosition(startX, startY, width, height);
    drawCutOutBox(
      startX,
      startY,
      width,
      height,
      this.screenShotCanvas as CanvasRenderingContext2D,
      this.data.getBorderSize(),
      this.screenShotContainer,
      this.screenShotImageController
    );
    // 保存边框节点信息
    this.cutOutBoxBorderArr = saveBorderArrInfo(
      this.data.getBorderSize(),
      this.drawGraphPosition
    );
    // 修改鼠标状态为拖动
    this.screenShotContainer.style.cursor = "move";
    // 显示截图工具栏
    this.data.setToolStatus(true);
    // 显示裁剪框尺寸显示容器
    this.data.setCutBoxSizeStatus(true);
    if (this.toolController != null) {
      // 渲染截图工具栏
      this.showToolBar();
    }
  }

  /**
   * 从窗口数据流中截取页面body内容
   * @param videoWidth 窗口宽度
   * @param videoHeight 窗口高度
   * @param containerWidth body内容宽度
   * @param containerHeight body内容高度
   * @private
   */
  private getWindowContentData(
    videoWidth: number,
    videoHeight: number,
    containerWidth: number,
    containerHeight: number
  ) {
    const videoCanvas = document.createElement("canvas");
    videoCanvas.width = videoWidth;
    videoCanvas.height = videoHeight;
    const videoContext = getCanvas2dCtx(videoCanvas, videoWidth, videoHeight);
    if (videoContext) {
      videoContext.drawImage(this.videoController, 0, 0);
      const startX = 0;
      const startY = videoHeight - containerHeight;
      const width = containerWidth;
      const height = videoHeight - startY;
      // 获取裁剪框区域图片信息;
      return videoContext.getImageData(
        startX * this.dpr,
        startY * this.dpr,
        width * this.dpr,
        height * this.dpr
      );
    }
    return null;
  }

  // 为指定容器绑定快捷键
  private registerContainerShortcuts(container: HTMLElement) {
    container.addEventListener("keydown", (event: KeyboardEvent) => {
      if (this.screenShotCanvas == null) return;
      // command/ctrl + enter 将输入框的文字绘制到画布内
      // 按下ESC时如果有内容则绘制
      if (
        ((event.metaKey || event.ctrlKey) && event.code === "Enter") ||
        event.code === "Escape"
      ) {
        this.data.setTextEditState(true);
        const text = container.innerText;
        if (!text || text === "") {
          // 隐藏输入框
          this.data.setTextStatus(false);
          return;
        }
        drawText(
          text,
          this.textInputPosition.mouseX,
          this.textInputPosition.mouseY,
          this.data.getSelectedColor(),
          this.data.getFontSize(),
          this.screenShotCanvas
        );
        // 清空文本输入区域的内容
        container.innerHTML = "";
        // 隐藏输入框
        this.data.setTextStatus(false);
        // 保存绘制记录
        addHistory();
      }
    });
  }

  private showToolBar(): void {
    if (this.toolController == null || this.screenShotContainer == null) return;
    // 计算截图工具栏位置
    const toolLocation = calculateToolLocation(
      this.drawGraphPosition,
      this.toolController.offsetWidth,
      this.screenShotContainer.width / this.dpr,
      this.placement,
      this.position
    );
    const containerHeight = this.screenShotContainer.height / this.dpr;

    // 工具栏的位置超出截图容器时，调整工具栏位置防止超出
    if (toolLocation.mouseY > containerHeight - 64) {
      toolLocation.mouseY -= this.drawGraphPosition.height + 64;
      // 超出屏幕顶部时
      if (toolLocation.mouseY < 0) {
        const containerHeight = parseInt(this.screenShotContainer.style.height);
        toolLocation.mouseY = containerHeight - this.fullScreenDiffHeight;
      }
      // 设置工具栏超出状态为true
      this.data.setToolPositionStatus(true);
      // 隐藏裁剪框尺寸显示容器
      this.data.setCutBoxSizeStatus(false);
    }

    // 当前截取的是全屏，则修改工具栏的位置到截图容器最底部，防止超出
    if (this.getFullScreenStatus) {
      const containerHeight = parseInt(this.screenShotContainer.style.height);
      // 重新计算工具栏的x轴位置
      const toolPositionX =
        (this.drawGraphPosition.width / this.dpr -
          this.toolController.offsetWidth) /
        2;
      toolLocation.mouseY = containerHeight - this.fullScreenDiffHeight;
      toolLocation.mouseX = toolPositionX;
    }

    // 显示并设置截图工具栏位置
    this.data.setToolInfo(
      toolLocation.mouseX + this.position.left,
      toolLocation.mouseY + this.position.top
    );

    // 设置裁剪框尺寸显示容器位置
    this.data.setCutBoxSizePosition(
      this.drawGraphPosition.startX,
      this.drawGraphPosition.startY - 35
    );
    // 渲染裁剪框尺寸
    this.data.setCutBoxSize(
      this.drawGraphPosition.width,
      this.drawGraphPosition.height
    );

    // 状态重置
    this.getFullScreenStatus = false;
  }

  private setGlobalParameter() {
    this.screenShotContainer = this.data.getScreenShotContainer() as HTMLCanvasElement | null;
    this.toolController = this.data.getToolController() as HTMLDivElement | null;
    this.textInputController = this.data.getTextInputController() as HTMLDivElement | null;
    this.optionController = this.data.getOptionController() as HTMLDivElement | null;
    this.optionIcoController = this.data.getOptionIcoController() as HTMLDivElement | null;
    this.cutBoxSizeContainer = this.data.getCutBoxSizeContainer() as HTMLDivElement | null;
  }

  private setOptionalParameter(options: screenShotType) {
    // 单击截取全屏启用状态,默认为false
    if (options?.clickCutFullScreen === true) {
      this.clickCutFullScreen = true;
    }
    // 判断调用者是否传了截图进来
    if (options?.imgSrc != null) {
      this.imgSrc = options.imgSrc;
    }
    // 是否加载跨域图片
    if (options?.loadCrossImg === true) {
      this.loadCrossImg = true;
    }
    // 跨域时的代理服务器地址
    if (options?.proxyUrl) {
      this.proxyUrl = options.proxyUrl;
    }
    if (options?.useCORS) {
      this.useCORS = options.useCORS;
    }
    // 设置截图容器的位置信息
    if (options?.position != null) {
      if (options.position?.top != null) {
        this.position.top = options.position.top;
      }
      if (options.position?.left != null) {
        this.position.left = options.position.left;
      }
    }
    // 截图容器dom
    if (options?.screenShotDom) {
      this.screenShotDom = options.screenShotDom;
    }
    // webrtc截图等待时间
    if (options?.wrcReplyTime) {
      this.wrcReplyTime = options.wrcReplyTime;
    }
    // 是否初始化裁剪框
    if (options?.cropBoxInfo) {
      this.cropBoxInfo = options.cropBoxInfo;
    }
    // 是否需要更改工具栏的展示位置
    if (options?.toolPosition) {
      this.placement = options.toolPosition;
    }
    // 是否需要对webrtc模式下捕获到的内容进行裁剪
    if (options?.wrcImgPosition) {
      const { x, y } = options.wrcImgPosition;
      // 坐标需要取负数才能正确的裁剪
      this.wrcImgPosition.x = Math.abs(x) * -1;
      this.wrcImgPosition.y = Math.abs(y) * -1;
    }
    // 是否隐藏滚动条
    if (options?.hiddenScrollBar != null) {
      const {
        state,
        color,
        fillWidth,
        fillHeight,
        fillState
      } = options.hiddenScrollBar;
      this.hiddenScrollBar = {
        state,
        color: color ? color : "#000000",
        fillWidth: fillWidth ? fillWidth : 0,
        fillHeight: fillHeight ? fillHeight : 0,
        fillState: fillState ? fillState : false
      };
      if (state) {
        this.data.setResetScrollbarState(true);
        // 设置页面宽高并隐藏滚动条
        document.documentElement.classList.add("hidden-screen-shot-scroll");
        document.body.classList.add("hidden-screen-shot-scroll");
      }
    }
    // 是否启用窗口截图模式
    if (options?.wrcWindowMode != null) {
      this.wrcWindowMode = options.wrcWindowMode;
    }
    if (options?.customRightClickEvent != null) {
      this.customRightClickEvent = options.customRightClickEvent;
    }
  }

  // 鼠标抬起事件
  private mouseUpEvent = () => {
    // 当前操作的是撤销
    if (this.data.getToolName() == "undo") return;
    // 绘制结束
    this.data.setDragging(false);
    this.data.setDraggingTrim(false);

    // 截图容器判空
    if (this.screenShotCanvas == null || this.screenShotContainer == null) {
      return;
    }
    // 工具栏未点击且鼠标未拖动且单击截屏状态为false则复原裁剪框位置
    if (
      !this.data.getToolClickStatus() &&
      !this.dragFlag &&
      !this.clickCutFullScreen
    ) {
      // 复原裁剪框的坐标
      this.drawGraphPosition.startX = this.drawGraphPrevX;
      this.drawGraphPosition.startY = this.drawGraphPrevY;
      return;
    }

    // 调用者尚未拖拽生成选区
    // 鼠标尚未拖动
    // 单击截取屏幕状态为true
    // 则截取整个屏幕
    const cutBoxPosition = this.data.getCutOutBoxPosition();
    if (
      cutBoxPosition.width === 0 &&
      cutBoxPosition.height === 0 &&
      cutBoxPosition.startX === 0 &&
      cutBoxPosition.startY === 0 &&
      !this.dragFlag &&
      this.clickCutFullScreen
    ) {
      const borderSize = this.data.getBorderSize();
      this.getFullScreenStatus = true;
      // 设置裁剪框位置为全屏
      this.tempGraphPosition = drawCutOutBox(
        0,
        0,
        this.screenShotContainer.width - borderSize / 2,
        this.screenShotContainer.height - borderSize / 2,
        this.screenShotCanvas,
        borderSize,
        this.screenShotContainer,
        this.screenShotImageController
      ) as drawCutOutBoxReturnType;
    }

    if (this.screenShotContainer == null || this.screenShotCanvas == null) {
      return;
    }
    // 工具栏已点击且进行了绘制
    if (this.data.getToolClickStatus() && this.drawStatus) {
      // 保存绘制记录
      addHistory();
      return;
    } else if (this.data.getToolClickStatus() && !this.drawStatus) {
      // 工具栏点击了但尚未进行绘制
      return;
    }
    // 保存绘制后的图形位置信息
    this.drawGraphPosition = this.tempGraphPosition;
    // 如果工具栏未点击则保存裁剪框位置
    if (!this.data.getToolClickStatus()) {
      const { startX, startY, width, height } = this.drawGraphPosition;
      this.data.setCutOutBoxPosition(startX, startY, width, height);
    }
    // 保存边框节点信息
    this.cutOutBoxBorderArr = saveBorderArrInfo(
      this.data.getBorderSize(),
      this.drawGraphPosition
    );
    // 鼠标按下且拖动时重新渲染工具栏
    if (
      (this.screenShotContainer != null && this.dragFlag) ||
      this.clickCutFullScreen
    ) {
      // 修改鼠标状态为拖动
      this.screenShotContainer.style.cursor = "move";
      // 显示截图工具栏
      this.data.setToolStatus(true);
      // 显示裁剪框尺寸显示容器
      this.data.setCutBoxSizeStatus(true);
      // 复原拖动状态
      this.dragFlag = false;
      if (this.toolController != null) {
        this.showToolBar();
      }
    }
  };

  /**
   * 操作裁剪框
   * @param currentX 裁剪框当前x轴坐标
   * @param currentY 裁剪框当前y轴坐标
   * @param startX 鼠标x轴坐标
   * @param startY 鼠标y轴坐标
   * @param width 裁剪框宽度
   * @param height 裁剪框高度
   * @param context 需要进行绘制的canvas画布
   * @private
   */
  private operatingCutOutBox(
    currentX: number,
    currentY: number,
    startX: number,
    startY: number,
    width: number,
    height: number,
    context: CanvasRenderingContext2D
  ) {
    // canvas元素不存在
    if (this.screenShotContainer == null) {
      return;
    }
    // 获取鼠标按下时的坐标
    const { moveStartX, moveStartY } = this.movePosition;

    // 裁剪框边框节点事件存在且裁剪框未进行操作，则对鼠标样式进行修改
    if (this.cutOutBoxBorderArr.length > 0 && !this.data.getDraggingTrim()) {
      // 标识鼠标是否在裁剪框内
      let flag = false;
      // 判断鼠标位置
      context.beginPath();
      for (let i = 0; i < this.cutOutBoxBorderArr.length; i++) {
        context.rect(
          this.cutOutBoxBorderArr[i].x,
          this.cutOutBoxBorderArr[i].y,
          this.cutOutBoxBorderArr[i].width,
          this.cutOutBoxBorderArr[i].height
        );
        // 当前坐标点处于8个可操作点上，修改鼠标指针样式
        if (context.isPointInPath(currentX * this.dpr, currentY * this.dpr)) {
          switch (this.cutOutBoxBorderArr[i].index) {
            case 1:
              if (this.data.getToolClickStatus()) {
                // 修改截图容器内的鼠标样式
                updateContainerMouseStyle(
                  this.screenShotContainer,
                  this.data.getActiveToolName()
                );
              } else {
                this.screenShotContainer.style.cursor = "move";
              }
              break;
            case 2:
              // 工具栏被点击则不改变指针样式
              if (this.data.getToolClickStatus()) break;
              this.screenShotContainer.style.cursor = "ns-resize";
              break;
            case 3:
              if (this.data.getToolClickStatus()) break;
              this.screenShotContainer.style.cursor = "ew-resize";
              break;
            case 4:
              if (this.data.getToolClickStatus()) break;
              this.screenShotContainer.style.cursor = "nwse-resize";
              break;
            case 5:
              if (this.data.getToolClickStatus()) break;
              this.screenShotContainer.style.cursor = "nesw-resize";
              break;
            default:
              break;
          }
          this.borderOption = this.cutOutBoxBorderArr[i].option;
          flag = true;
          break;
        }
      }
      this.mouseInsideCropBox = flag;
      context.closePath();
      if (!flag) {
        // 鼠标移出裁剪框重置鼠标样式
        this.screenShotContainer.style.cursor = "default";
        // 重置当前操作的边框节点为null
        this.borderOption = null;
      }
    }

    // 裁剪框正在被操作
    if (this.data.getDraggingTrim()) {
      // 当前操作节点为1时则为移动裁剪框
      if (this.borderOption === 1) {
        // 计算要移动的x轴坐标
        let x = fixedData(
          currentX - (moveStartX - startX),
          width,
          this.screenShotContainer.width
        );
        // 计算要移动的y轴坐标
        let y = fixedData(
          currentY - (moveStartY - startY),
          height,
          this.screenShotContainer.height
        );
        // 计算画布面积
        const containerWidth = this.screenShotContainer.width / this.dpr;
        const containerHeight = this.screenShotContainer.height / this.dpr;
        // 计算裁剪框在画布上所占的面积
        const cutOutBoxSizeX = x + width;
        const cutOutBoxSizeY = y + height;
        // 超出画布的可视区域，进行位置修正
        if (cutOutBoxSizeX > containerWidth) {
          x = containerWidth - width;
        }
        if (cutOutBoxSizeY > containerHeight) {
          y = containerHeight - height;
        }

        // 重新绘制裁剪框
        this.tempGraphPosition = drawCutOutBox(
          x,
          y,
          width,
          height,
          context,
          this.data.getBorderSize(),
          this.screenShotContainer as HTMLCanvasElement,
          this.screenShotImageController
        ) as drawCutOutBoxReturnType;
      } else {
        // 裁剪框其他8个点的拖拽事件
        const {
          tempStartX,
          tempStartY,
          tempWidth,
          tempHeight
        } = zoomCutOutBoxPosition(
          currentX,
          currentY,
          startX,
          startY,
          width,
          height,
          this.borderOption as number
        ) as zoomCutOutBoxReturnType;
        // 绘制裁剪框
        this.tempGraphPosition = drawCutOutBox(
          tempStartX,
          tempStartY,
          tempWidth,
          tempHeight,
          context,
          this.data.getBorderSize(),
          this.screenShotContainer as HTMLCanvasElement,
          this.screenShotImageController
        ) as drawCutOutBoxReturnType;
      }
    }
  }

  /**
   * 显示最新的画布状态
   * @private
   */
  private showLastHistory() {
    if (this.screenShotCanvas != null) {
      const context = this.screenShotCanvas;
      if (this.data.getHistory().length <= 0) {
        addHistory();
      }
      context.putImageData(
        this.data.getHistory()[this.data.getHistory().length - 1]["data"],
        0,
        0
      );
    }
  }

  // 为截图容器添加鼠标||触摸的事件监听
  private setScreenShotContainerEventListener() {
    if (isPC()) {
      // 添加鼠标事件监听
      this.screenShotContainer?.addEventListener(
        "mousedown",
        this.mouseDownEvent
      );
      this.screenShotContainer?.addEventListener(
        "mousemove",
        this.mouseMoveEvent
      );
      this.screenShotContainer?.addEventListener("mouseup", this.mouseUpEvent);
    }
    // 设备不支持触摸事件则退出
    if (!isTouchDevice()) return;
    // 设置触摸监听
    this.screenShotContainer?.addEventListener(
      "touchstart",
      this.mouseDownEvent,
      false
    );
    this.screenShotContainer?.addEventListener(
      "touchmove",
      this.mouseMoveEvent,
      false
    );
    this.screenShotContainer?.addEventListener(
      "touchend",
      this.mouseUpEvent,
      false
    );
  }

  /**
   * 向截图容器中绘制图片
   * @param triggerCallback
   * @param context
   * @param imgSrc
   * @private
   */
  private drawPictures(
    triggerCallback: Function | undefined,
    context: CanvasRenderingContext2D,
    imgSrc: string
  ) {
    const imgContainer = new Image();

    imgContainer.src = imgSrc;
    imgContainer.width = this.screenShotImageController.width;
    imgContainer.height = this.screenShotImageController.height;
    imgContainer.crossOrigin = "Anonymous";
    imgContainer.onload = () => {
      // 装载截图的dom为null则退出
      if (this.screenShotContainer == null) return;

      // 将用户传递的图片绘制到图片容器里
      this.screenShotImageController
        .getContext("2d")
        ?.drawImage(
          imgContainer,
          0,
          0,
          this.screenShotImageController.width,
          this.screenShotImageController.height
        );
      // 初始化截图容器
      this.initScreenShot(
        triggerCallback,
        context,
        this.screenShotImageController
      );
    };
  }

  /**
   * 初始化截图容器
   * @param triggerCallback
   * @param context
   * @param screenShotContainer
   * @private
   */
  private initScreenShot(
    triggerCallback: Function | undefined,
    context: CanvasRenderingContext2D,
    screenShotContainer: HTMLCanvasElement
  ) {
    if (triggerCallback != null) {
      // 加载成功，执行回调函数
      triggerCallback({ code: 0, msg: "截图加载完成" });
    }
    // 赋值截图区域canvas画布
    this.screenShotCanvas = context;
    // 存储屏幕截图
    this.data.setScreenShotImageController(screenShotContainer);

    // 绘制蒙层
    drawMasking(context, screenShotContainer);
    // 截图容器添加鼠标点击/触摸事件的监听
    this.setScreenShotContainerEventListener();
    // 是否初始化裁剪框
    if (this.cropBoxInfo != null && Object.keys(this.cropBoxInfo).length == 4) {
      this.initCropBox(this.cropBoxInfo);
    }
  }
}
