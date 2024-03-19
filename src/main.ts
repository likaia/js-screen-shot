import CreateDom from "@/lib/main-entrance/CreateDom";
// 导入截图所需样式
import "@/assets/scss/screen-shot.scss";
import InitData from "@/lib/main-entrance/InitData";
import {
  crcEventType,
  cutOutBoxBorder,
  drawCutOutBoxReturnType,
  genericMethodPostbackType,
  movePositionType,
  positionInfoType,
  screenShotType,
  toolPositionValType
} from "@/lib/type/ComponentType";
import { drawMasking } from "@/lib/split-methods/DrawMasking";
import { nonNegativeData } from "@/lib/common-methods/FixedData";
import { drawCutOutBox } from "@/lib/split-methods/DrawCutOutBox";
import PlugInParameters from "@/lib/main-entrance/PlugInParameters";
import { getDrawBoundaryStatus } from "@/lib/split-methods/BoundaryJudgment";
import KeyboardEventHandle from "@/lib/split-methods/KeyboardEventHandle";
import { setPlugInParameters } from "@/lib/split-methods/SetPlugInParameters";
import { getCanvas2dCtx } from "@/lib/common-methods/CanvasPatch";
import { addHistory } from "@/lib/split-methods/AddHistoryData";
import {
  drawPictures,
  fixWrcSize,
  getContainerSize,
  getWindowContentData,
  h2cScreenShot,
  handleGraffitiDraw,
  operatingCutOutBox,
  registerContainerShortcuts,
  registerForRightClickEvent,
  setScreenShotContainerSize,
  adjustContainerLevels,
  initCropBox,
  setScreenShotContainerEventListener,
  sendStream,
  startCapture,
  stopCapture
} from "@/lib/main-entrance/LoadCoreComponents";
import {
  mouseDownCore,
  mouseUpCore
} from "@/lib/main-entrance/MouseEventHandling";

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
    const { noScroll, triggerCallback, cancelCallback, level } = options;
    // 获取截图区域canvas容器(获取的同时也会为InitData中的全局变量赋值)
    this.setGlobalParameter();
    // 修改截图容器可滚动状态
    this.data.setNoScrollStatus(noScroll);

    // 加载截图组件
    this.load(triggerCallback, cancelCallback).then(() => {
      if (
        this.toolController == null ||
        this.screenShotContainer == null ||
        this.textInputController == null
      ) {
        return;
      }
      // 截图组件加载完毕后，对层级进行调整
      adjustContainerLevels(level ? level : 0, {
        screenShotContainer: this.screenShotContainer,
        toolController: this.toolController,
        textInputController: this.textInputController,
        optionIcoController: this.optionIcoController,
        optionController: this.optionController,
        cutBoxSizeContainer: this.cutBoxSizeContainer
      });
      // 为截图容器创建事件监听
      this.createEvent(
        this.screenShotContainer,
        this.toolController,
        this.textInputController
      );
    });
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

  // 加载截图组件
  private async load(
    triggerCallback: Function | undefined,
    cancelCallback: Function | undefined
  ) {
    const canvasSize = this.plugInParameters.getCanvasSize();
    const viewSize = {
      width: parseFloat(window.getComputedStyle(document.body).width),
      height: parseFloat(window.getComputedStyle(document.body).height)
    };
    // 设置截图容器尺寸信息
    setScreenShotContainerSize(
      this.screenShotImageController,
      this.data,
      canvasSize,
      viewSize,
      this.position
    );

    if (this.screenShotContainer == null) return;
    // 获取截图区域canvas容器画布
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
        const callerCallback = (res: genericMethodPostbackType) => {
          if (res.code === 1 && res.data == null) {
            this.initScreenShot(
              triggerCallback,
              context,
              this.screenShotImageController
            );
          }
        };
        drawPictures(
          this.imgSrc,
          this.screenShotImageController,
          callerCallback
        );
        return;
      }
      const result = await h2cScreenShot(
        triggerCallback,
        this.screenShotDom,
        this.loadCrossImg,
        this.proxyUrl
      );
      if (result.code === 0) {
        // 存储html2canvas截取的内容
        const canvasData = result.data.canvas;
        this.screenShotImageController = canvasData;
        // 初始化截图容器
        this.initScreenShot(triggerCallback, context, canvasData);
      }
      return;
    }
    // 调用者有传入屏幕流数据则使用
    if (this.plugInParameters.getScreenFlow()) {
      sendStream(
        this.plugInParameters.getScreenFlow(),
        cancelCallback,
        triggerCallback,
        this.data,
        { videoController: this.videoController },
        {
          loadScreenFlowData: this.loadScreenFlowData
        }
      );
      return;
    }
    this.wrcScreenShot(cancelCallback, triggerCallback);
  }

  private loadScreenFlowData(triggerCallback: Function | undefined) {
    setTimeout(() => {
      // 获取截图区域canvas容器画布
      if (this.screenShotContainer == null) return;
      const {
        containerWidth,
        containerHeight,
        imgContainerWidth,
        imgContainerHeight
      } = getContainerSize(
        this.plugInParameters.getCanvasSize(),
        this.screenShotImageController,
        this.wrcWindowMode,
        this.dpr
      );
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
        const bodyImgData = getWindowContentData(
          videoWidth,
          videoHeight,
          containerWidth * this.dpr,
          containerHeight * this.dpr,
          this.videoController,
          this.dpr
        );
        if (bodyImgData == null) return;
        // 将body内容绘制到图片容器里
        imgContext.putImageData(bodyImgData, 0, 0);
      } else {
        // 对webrtc源提供的图像宽高进行修复
        fixWrcSize(
          containerWidth,
          containerHeight,
          videoWidth,
          videoHeight,
          this.wrcImgPosition,
          imgContext,
          this.videoController,
          this.hiddenScrollBar
        );
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
      stopCapture(this.videoController);
      // 重置光标状态
      document.body.classList.remove("no-cursor");
    }, this.wrcReplyTime);
  }

  // webrtc模式截屏
  private wrcScreenShot = (
    cancelCallback: Function | undefined,
    triggerCallback: Function | undefined
  ) => {
    // 隐藏光标
    document.body.classList.add("no-cursor");
    const callerCallback = (res: genericMethodPostbackType) => {
      if (res.code === 1 && res.data instanceof MediaStream) {
        this.captureStream = res.data;
      }
    };
    // 开始捕捉屏幕
    startCapture(
      cancelCallback,
      this.data,
      {
        screenShotImageController: this.screenShotImageController,
        videoController: this.videoController
      },
      { dpr: this.dpr, wrcWindowMode: this.wrcWindowMode },
      callerCallback
    ).then(() => {
      this.loadScreenFlowData(triggerCallback);
    });
  };

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
    setScreenShotContainerEventListener(this.screenShotContainer, {
      mouseDownEvent: this.mouseDownEvent,
      mouseMoveEvent: this.mouseMoveEvent,
      mouseUpEvent: this.mouseUpEvent
    });
    // 是否初始化裁剪框
    if (this.cropBoxInfo != null && Object.keys(this.cropBoxInfo).length == 4) {
      initCropBox(
        this.dpr,
        this.cropBoxInfo,
        this.data,
        {
          screenShotContainer: this.screenShotContainer,
          screenShotImageController: this.screenShotImageController,
          screenShotCanvas: this.screenShotCanvas,
          toolController: this.toolController
        },
        {
          drawGraphPosition: this.drawGraphPosition,
          cutOutBoxBorderArr: this.cutOutBoxBorderArr,
          placement: this.placement,
          position: this.position,
          fullScreenDiffHeight: this.fullScreenDiffHeight,
          getFullScreenStatus: this.getFullScreenStatus
        },
        { toolBarCallerCallback: this.toolBarCallerCallback }
      );
    }
  }

  // 鼠标按下事件
  private mouseDownEvent = (event: MouseEvent | TouchEvent) => {
    this.drawStatus = false;
    // 隐藏颜色选择面板
    this.data.setColorPanelStatus(false);
    // 隐藏文字大小选择面板
    this.data.setTextSizeOptionStatus(false);
    // 非鼠标左键按下则终止
    if (event instanceof MouseEvent && event.button != 0) return;
    const saveDrawGraphCallerCallback = (res: genericMethodPostbackType) => {
      if (res.code === 1 && res.data != null) {
        this.drawGraphPrevX = (res.data as positionInfoType).startX;
        this.drawGraphPrevY = (res.data as positionInfoType).startY;
      }
    };
    mouseDownCore(
      event,
      this.data,
      {
        screenShotCanvas: this.screenShotCanvas,
        screenShotContainer: this.screenShotContainer,
        screenShotImageController: this.screenShotImageController,
        textInputController: this.textInputController
      },
      {
        tempGraphPosition: this.tempGraphPosition,
        dpr: this.dpr,
        movePosition: this.movePosition,
        cutOutBoxBorderArr: this.cutOutBoxBorderArr,
        borderOption: this.borderOption,
        drawGraphPosition: this.drawGraphPosition,
        mouseInsideCropBox: this.mouseInsideCropBox,
        textInputPosition: this.textInputPosition,
        position: this.position
      },
      {
        croppingBoxCallerCallback: this.croppingBoxCallerCallback,
        saveDrawGraphCallerCallback: saveDrawGraphCallerCallback
      }
    );
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
      const callerCallback = (res: genericMethodPostbackType) => {
        if (
          res.code === 1 &&
          res.data != null &&
          typeof res.data === "boolean"
        ) {
          this.drawStatus = res.data;
        }
      };
      // 处理涂鸦绘制
      handleGraffitiDraw(
        this.drawStatus,
        startX,
        startY,
        tempWidth,
        tempHeight,
        currentX,
        currentY,
        this.degreeOfBlur,
        this.data,
        this.plugInParameters.getRatioArrow(),
        {
          screenShotCanvas: this.screenShotCanvas
        },
        { showLastHistory: this.showLastHistory },
        callerCallback
      );
      return;
    }
    // 执行裁剪框操作函数
    operatingCutOutBox(
      currentX,
      currentY,
      startX,
      startY,
      width,
      height,
      this.screenShotCanvas,
      this.data,
      this.dpr,
      {
        screenShotContainer: this.screenShotContainer,
        screenShotImageController: this.screenShotImageController
      },
      {
        movePosition: this.movePosition,
        tempGraphPosition: this.tempGraphPosition,
        cutOutBoxBorderArr: this.cutOutBoxBorderArr,
        borderOption: this.borderOption
      },
      this.croppingBoxCallerCallback
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
    const updateTempGraphPositionCallback = (
      res: genericMethodPostbackType
    ) => {
      if (res.code === 1 && res.data != null) {
        const { getFullScreenStatus, tempGraphPosition } = res.data as {
          getFullScreenStatus: boolean;
          tempGraphPosition: drawCutOutBoxReturnType;
        };
        this.getFullScreenStatus = getFullScreenStatus;
        this.tempGraphPosition = tempGraphPosition;
      }
    };
    const updateDrawStatusCallback = (res: genericMethodPostbackType) => {
      if (res.code === 1 && typeof res.data === "boolean") {
        this.drawStatus = res.data;
      }
    };
    mouseUpCore(
      this.data,
      {
        dragFlag: this.dragFlag,
        drawStatus: this.drawStatus,
        clickCutFullScreen: this.clickCutFullScreen,
        drawGraphPosition: this.drawGraphPosition,
        cutOutBoxBorderArr: this.cutOutBoxBorderArr,
        drawGraphPrevX: this.drawGraphPrevX,
        drawGraphPrevY: this.drawGraphPrevY,
        tempGraphPosition: this.tempGraphPosition,
        placement: this.placement,
        position: this.position,
        fullScreenDiffHeight: this.fullScreenDiffHeight,
        getFullScreenStatus: this.getFullScreenStatus,
        dpr: this.dpr
      },
      {
        screenShotCanvas: this.screenShotCanvas,
        screenShotContainer: this.screenShotContainer,
        screenShotImageController: this.screenShotImageController,
        toolController: this.toolController
      },
      {
        toolBarCallerCallback: this.toolBarCallerCallback,
        updateTempGraphPositionCallback,
        updateDrawStatusCallback
      }
    );
  };

  // 裁剪框回调
  // 对组件内部所依赖的数据做处理
  private croppingBoxCallerCallback = (res: genericMethodPostbackType) => {
    const { code, data } = res;
    if (code === 1 && typeof data === "number") {
      this.borderOption = data;
    }
    if (code === 2 && typeof data === "boolean") {
      this.mouseInsideCropBox = data;
    }
    if (code === 3 && typeof data === null) {
      this.borderOption = null;
    }
  };

  // 工具栏展示时，对组件内部所依赖数据做处理
  private toolBarCallerCallback = (res: genericMethodPostbackType) => {
    if (res.code === 1 && typeof res.data === "boolean") {
      this.getFullScreenStatus = res.data;
    }
  };

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

  // 创建监听事件
  private createEvent(
    screenShotContainer: HTMLCanvasElement,
    toolController: HTMLDivElement,
    textInputController: HTMLDivElement
  ) {
    // 创建键盘事件监听
    this.keyboardEventHandle = new KeyboardEventHandle(
      screenShotContainer,
      toolController
    );
    // 给输入容器设置快捷键监听
    registerContainerShortcuts(
      textInputController,
      this.screenShotCanvas,
      this.data,
      this.textInputPosition
    );
    if (this.customRightClickEvent.state) {
      // 给截图容器添加右键事件监听
      registerForRightClickEvent(
        screenShotContainer,
        this.data,
        this.customRightClickEvent.handleFn
      );
    }
  }
}
