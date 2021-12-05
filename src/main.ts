import CreateDom from "@/lib/main-entrance/CreateDom";
// 导入截图所需样式
import "@/assets/scss/screen-short.scss";
import InitData from "@/lib/main-entrance/InitData";
import {
  cutOutBoxBorder,
  drawCutOutBoxReturnType,
  movePositionType,
  positionInfoType,
  screenShotType,
  zoomCutOutBoxReturnType
} from "@/lib/type/ComponentType";
import { drawMasking } from "@/lib/split-methods/DrawMasking";
import { fixedData, nonNegativeData } from "@/lib/common-methords/FixedData";
import { drawPencil, initPencil } from "@/lib/split-methods/DrawPencil";
import { drawText } from "@/lib/split-methods/DrawText";
import { drawRectangle } from "@/lib/split-methods/DrawRectangle";
import { drawCircle } from "@/lib/split-methods/DrawCircle";
import { drawLineArrow } from "@/lib/split-methods/DrawLineArrow";
import { drawMosaic } from "@/lib/split-methods/DrawMosaic";
import { drawCutOutBox } from "@/lib/split-methods/DrawCutOutBox";
import { zoomCutOutBoxPosition } from "@/lib/common-methords/ZoomCutOutBoxPosition";
import { saveBorderArrInfo } from "@/lib/common-methords/SaveBorderArrInfo";
import { calculateToolLocation } from "@/lib/split-methods/CalculateToolLocation";
import html2canvas from "html2canvas";
import PlugInParameters from "@/lib/main-entrance/PlugInParameters";
import { getDrawBoundaryStatus } from "@/lib/split-methods/BoundaryJudgment";

export default class ScreenShort {
  // 当前实例的响应式data数据
  private readonly data: InitData;

  // video容器用于存放屏幕MediaStream流
  private readonly videoController: HTMLVideoElement;
  // 截图区域canvas容器
  private readonly screenShortController: HTMLCanvasElement | null;
  // 截图工具栏dom
  private readonly toolController: HTMLDivElement | null;
  // 截图图片存放容器
  private screenShortImageController: HTMLCanvasElement;
  // 截图区域画布
  private screenShortCanvas: CanvasRenderingContext2D | undefined;
  // 文本区域dom
  private readonly textInputController: HTMLDivElement | null;
  // 截图工具栏画笔选项dom
  private optionController: HTMLDivElement | null;
  private optionIcoController: HTMLDivElement | null;
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
  // 裁剪框边框节点坐标事件
  private cutOutBoxBorderArr: Array<cutOutBoxBorder> = [];
  // 当前操作的边框节点
  private borderOption: number | null = null;

  // 点击裁剪框时的鼠标坐标
  private movePosition: movePositionType = {
    moveStartX: 0,
    moveStartY: 0
  };

  // 鼠标点击状态
  private clickFlag = false;
  // 鼠标拖动状态
  private dragFlag = false;
  // 单击截取屏启用状态
  private clickCutFullScreen = false;
  // 上一个裁剪框坐标信息
  private drawGraphPrevX = 0;
  private drawGraphPrevY = 0;
  private fontSize = 17;
  // 最大可撤销次数
  private maxUndoNum = 15;
  // 马赛克涂抹区域大小
  private degreeOfBlur = 5;
  // 截图容器位置信息
  private position: { top: number; left: number } = { left: 0, top: 0 };

  // 文本输入框位置
  private textInputPosition: { mouseX: number; mouseY: number } = {
    mouseX: 0,
    mouseY: 0
  };
  constructor(options: screenShotType) {
    const plugInParameters = new PlugInParameters();
    // webrtc启用状态
    if (
      options &&
      Object.prototype.hasOwnProperty.call(options, "enableWebRtc")
    ) {
      plugInParameters.setWebRtcStatus(options.enableWebRtc);
    }
    // 单击截取全屏启用状态
    if (
      options &&
      Object.prototype.hasOwnProperty.call(options, "clickCutFullScreen")
    ) {
      this.clickCutFullScreen = options.clickCutFullScreen;
    }
    // 创建截图所需dom并设置回调函数
    new CreateDom(options);
    // 读取参数中的画布宽高
    if (
      options &&
      Object.prototype.hasOwnProperty.call(options, "canvasWidth") &&
      Object.prototype.hasOwnProperty.call(options, "canvasHeight")
    ) {
      plugInParameters.setCanvasSize(options.canvasWidth, options.canvasHeight);
    }
    // 设置截图容器的位置信息
    if (options && Object.prototype.hasOwnProperty.call(options, "position")) {
      if (options.position?.top != null) {
        this.position.top = options.position?.top;
      }
      if (options.position?.left != null) {
        this.position.left = options.position?.left;
      }
    }
    this.videoController = document.createElement("video");
    this.videoController.autoplay = true;
    this.screenShortImageController = document.createElement("canvas");
    // 实例化响应式data
    this.data = new InitData();
    // 获取截图区域canvas容器
    this.screenShortController = this.data.getScreenShortController() as HTMLCanvasElement | null;
    this.toolController = this.data.getToolController() as HTMLDivElement | null;
    this.textInputController = this.data.getTextInputController() as HTMLDivElement | null;
    this.optionController = this.data.getOptionController() as HTMLDivElement | null;
    this.optionIcoController = this.data.getOptionIcoController() as HTMLDivElement | null;
    this.load(options?.triggerCallback, options?.cancelCallback);
    const screenShotContainer = document.getElementById("screenShotContainer");
    if (screenShotContainer == null) return;
    // 调整层级
    screenShotContainer.style.zIndex = options?.level + "";
  }

  // 获取截图区域canvas容器
  public getCanvasController(): HTMLCanvasElement | null {
    return this.screenShortController;
  }

  // 加载截图组件
  private load(triggerCallback: Function, cancelCallback: Function) {
    const plugInParameters = new PlugInParameters();
    const canvasSize = plugInParameters.getCanvasSize();
    // 设置截图区域canvas宽高
    this.data.setScreenShortInfo(window.innerWidth, window.innerHeight);
    // 设置截图容器位置
    this.data.setScreenShotPosition(this.position.left, this.position.top);
    // 设置截图图片存放容器宽高
    this.screenShortImageController.width = window.innerWidth;
    this.screenShortImageController.height = window.innerHeight;
    // 用户有传宽高则使用用户传进来的
    if (canvasSize.canvasWidth !== 0 && canvasSize.canvasHeight !== 0) {
      this.data.setScreenShortInfo(
        canvasSize.canvasWidth,
        canvasSize.canvasHeight
      );
      this.screenShortImageController.width = canvasSize.canvasWidth;
      this.screenShortImageController.height = canvasSize.canvasHeight;
    }
    // 获取截图区域画canvas容器画布
    const context = this.screenShortController?.getContext("2d");
    if (context == null) return;
    // 启用webrtc截屏时则修改容器宽高
    if (plugInParameters.getWebRtcStatus()) {
      // 设置为屏幕宽高
      this.data.setScreenShortInfo(window.screen.width, window.screen.height);
      // 设置为屏幕宽高
      this.screenShortImageController.width = window.screen.width;
      this.screenShortImageController.height = window.screen.height;
      // 用户有传宽高则使用用户传进来的
      if (canvasSize.canvasWidth !== 0 && canvasSize.canvasHeight !== 0) {
        this.data.setScreenShortInfo(
          canvasSize.canvasWidth,
          canvasSize.canvasHeight
        );
        this.screenShortImageController.width = canvasSize.canvasWidth;
        this.screenShortImageController.height = canvasSize.canvasHeight;
      }
    }
    // 显示截图区域容器
    this.data.showScreenShortPanel();
    if (!plugInParameters.getWebRtcStatus()) {
      // html2canvas截屏
      html2canvas(document.body, {})
        .then(canvas => {
          // 装载截图的dom为null则退出
          if (this.screenShortController == null) return;

          if (triggerCallback != null) {
            // 获取页面元素成功，执行回调函数
            triggerCallback({ code: 0, msg: "截图加载完成" });
          }

          // 存放html2canvas截取的内容
          this.screenShortImageController = canvas;
          // 存储屏幕截图
          this.data.setScreenShortImageController(canvas);

          // 赋值截图区域canvas画布
          this.screenShortCanvas = context;
          // 绘制蒙层
          drawMasking(context);

          // 添加监听
          this.screenShortController?.addEventListener(
            "mousedown",
            this.mouseDownEvent
          );
          this.screenShortController?.addEventListener(
            "mousemove",
            this.mouseMoveEvent
          );
          this.screenShortController?.addEventListener(
            "mouseup",
            this.mouseUpEvent
          );
        })
        .catch(err => {
          if (triggerCallback != null) {
            // 获取页面元素成功，执行回调函数
            triggerCallback({ code: -1, msg: err });
          }
        });
      return;
    }
    // 截取整个屏幕
    this.screenShot(cancelCallback);
  }

  // 开始捕捉屏幕
  private startCapture = async (cancelCallback: Function) => {
    let captureStream = null;

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      // 捕获屏幕
      captureStream = await navigator.mediaDevices.getDisplayMedia();
      // 将MediaStream输出至video标签
      this.videoController.srcObject = captureStream;
    } catch (err) {
      if (cancelCallback != null) {
        cancelCallback({
          code: -1,
          msg: "浏览器不支持webrtc或者用户未授权"
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
  private screenShot = (cancelCallback: Function) => {
    // 开始捕捉屏幕
    this.startCapture(cancelCallback).then(() => {
      setTimeout(() => {
        // 获取截图区域canvas容器画布
        const context = this.screenShortController?.getContext("2d");
        if (context == null || this.screenShortController == null) return;

        // 赋值截图区域canvas画布
        this.screenShortCanvas = context;
        // 绘制蒙层
        drawMasking(context);
        const plugInParameters = new PlugInParameters();
        const canvasSize = plugInParameters.getCanvasSize();
        let containerWidth = this.screenShortImageController?.width;
        let containerHeight = this.screenShortImageController?.height;
        // 用户有传宽高时，则使用用户的
        if (canvasSize.canvasWidth !== 0 && canvasSize.canvasHeight !== 0) {
          containerWidth = canvasSize.canvasWidth;
          containerHeight = canvasSize.canvasHeight;
        }
        // 将获取到的屏幕截图绘制到图片容器里
        this.screenShortImageController
          .getContext("2d")
          ?.drawImage(
            this.videoController,
            0,
            0,
            containerWidth,
            containerHeight
          );
        // 存储屏幕截图
        this.data.setScreenShortImageController(
          this.screenShortImageController
        );
        // 添加监听
        this.screenShortController?.addEventListener(
          "mousedown",
          this.mouseDownEvent
        );
        this.screenShortController?.addEventListener(
          "mousemove",
          this.mouseMoveEvent
        );
        this.screenShortController?.addEventListener(
          "mouseup",
          this.mouseUpEvent
        );
        // 停止捕捉屏幕
        this.stopCapture();
      }, 500);
    });
  };

  // 鼠标按下事件
  private mouseDownEvent = (event: MouseEvent) => {
    // 当前操作的是撤销
    if (this.data.getToolName() == "undo") return;
    this.data.setDragging(true);
    this.clickFlag = true;
    const mouseX = nonNegativeData(event.offsetX);
    const mouseY = nonNegativeData(event.offsetY);

    // 如果当前操作的是截图工具栏
    if (this.data.getToolClickStatus()) {
      // 记录当前鼠标开始坐标
      this.drawGraphPosition.startX = mouseX;
      this.drawGraphPosition.startY = mouseY;
    }

    // 当前操作的是画笔
    if (this.data.getToolName() == "brush" && this.screenShortCanvas) {
      // 初始化画笔
      initPencil(this.screenShortCanvas, mouseX, mouseY);
    }

    // 当前操作的文本
    if (
      this.data.getToolName() == "text" &&
      this.textInputController &&
      this.screenShortController &&
      this.screenShortCanvas
    ) {
      // 修改鼠标样式
      this.screenShortController.style.cursor = "text";
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
          this.fontSize,
          this.screenShortCanvas
        );
        // 清空文本输入区域的内容
        this.textInputController.innerHTML = "";
        // 保存绘制记录
        this.addHistory();
      }
      // 计算文本框显示位置, 需要加上截图容器的位置信息
      const textMouseX = mouseX - 15 + this.position.left;
      const textMouseY = mouseY - 15 + this.position.top;
      // 修改文本区域位置
      this.textInputController.style.left = textMouseX + "px";
      this.textInputController.style.top = textMouseY + "px";
      setTimeout(() => {
        // 获取焦点
        if (this.textInputController) {
          this.textInputController.focus();
          // 记录当前输入框位置
          this.textInputPosition = { mouseX: mouseX, mouseY: mouseY };
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
  private mouseMoveEvent = (event: MouseEvent) => {
    if (
      this.screenShortCanvas == null ||
      this.screenShortController == null ||
      this.data.getToolName() == "undo"
    ) {
      return;
    }

    // 工具栏未选择且鼠标处于按下状态时
    if (!this.data.getToolClickStatus() && this.data.getDragging()) {
      // 修改拖动状态为true;
      this.dragFlag = true;
      // 隐藏截图工具栏
      this.data.setToolStatus(false);
    }
    this.clickFlag = false;
    // 获取当前绘制中的工具位置信息
    const { startX, startY, width, height } = this.drawGraphPosition;
    // 获取当前鼠标坐标
    const currentX = nonNegativeData(event.offsetX);
    const currentY = nonNegativeData(event.offsetY);
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
            this.screenShortCanvas,
            this.screenShortController,
            this.screenShortImageController
          );
          break;
        case "round":
          drawCircle(
            this.screenShortCanvas,
            currentX,
            currentY,
            startX,
            startY,
            this.data.getPenSize(),
            this.data.getSelectedColor()
          );
          break;
        case "right-top":
          drawLineArrow(
            this.screenShortCanvas,
            startX,
            startY,
            currentX,
            currentY,
            30,
            10,
            this.data.getPenSize(),
            this.data.getSelectedColor()
          );
          break;
        case "brush":
          // 画笔绘制
          drawPencil(
            this.screenShortCanvas,
            currentX,
            currentY,
            this.data.getPenSize(),
            this.data.getSelectedColor()
          );
          break;
        case "mosaicPen":
          // 绘制马赛克，为了确保鼠标位置在绘制区域中间，所以对x、y坐标进行-10处理
          drawMosaic(
            currentX - 10,
            currentY - 10,
            this.data.getPenSize(),
            this.degreeOfBlur,
            this.screenShortCanvas
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
      this.screenShortCanvas
    );
    // 如果鼠标未点击或者当前操作的是裁剪框都return
    if (!this.data.getDragging() || this.data.getDraggingTrim()) return;
    // 绘制裁剪框
    this.tempGraphPosition = drawCutOutBox(
      startX,
      startY,
      tempWidth,
      tempHeight,
      this.screenShortCanvas,
      this.data.getBorderSize(),
      this.screenShortController,
      this.screenShortImageController
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
    if (this.screenShortCanvas == null || this.screenShortController == null) {
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
      // 设置裁剪框位置为全屏
      this.tempGraphPosition = drawCutOutBox(
        0,
        0,
        this.screenShortController.width - borderSize / 2,
        this.screenShortController.height - borderSize / 2,
        this.screenShortCanvas,
        borderSize,
        this.screenShortController,
        this.screenShortImageController
      ) as drawCutOutBoxReturnType;
    }

    if (this.screenShortController == null || this.screenShortCanvas == null) {
      return;
    }
    // 工具栏已点击
    if (this.data.getToolClickStatus()) {
      // 保存绘制记录
      this.addHistory();
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
    if (this.screenShortController != null) {
      // 修改鼠标状态为拖动
      this.screenShortController.style.cursor = "move";
      // 显示截图工具栏
      this.data.setToolStatus(true);
      // 复原拖动状态
      this.dragFlag = false;
      if (this.toolController != null) {
        // 计算截图工具栏位置
        const toolLocation = calculateToolLocation(
          this.drawGraphPosition,
          this.toolController.offsetWidth
        );
        // 显示并设置截图工具栏位置
        this.data.setToolInfo(
          toolLocation.mouseX + this.position.left,
          toolLocation.mouseY + this.position.top
        );
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
    if (this.screenShortController == null) {
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
        if (context.isPointInPath(currentX, currentY)) {
          switch (this.cutOutBoxBorderArr[i].index) {
            case 1:
              if (this.data.getToolClickStatus()) {
                this.screenShortController.style.cursor = "crosshair";
              } else {
                this.screenShortController.style.cursor = "move";
              }
              break;
            case 2:
              // 工具栏被点击则不改变指针样式
              if (this.data.getToolClickStatus()) break;
              this.screenShortController.style.cursor = "ns-resize";
              break;
            case 3:
              if (this.data.getToolClickStatus()) break;
              this.screenShortController.style.cursor = "ew-resize";
              break;
            case 4:
              if (this.data.getToolClickStatus()) break;
              this.screenShortController.style.cursor = "nwse-resize";
              break;
            case 5:
              if (this.data.getToolClickStatus()) break;
              this.screenShortController.style.cursor = "nesw-resize";
              break;
            default:
              break;
          }
          this.borderOption = this.cutOutBoxBorderArr[i].option;
          flag = true;
          break;
        }
      }
      context.closePath();
      if (!flag) {
        // 鼠标移出裁剪框重置鼠标样式
        this.screenShortController.style.cursor = "default";
        // 重置当前操作的边框节点为null
        this.borderOption = null;
      }
    }

    // 裁剪框正在被操作
    if (this.data.getDraggingTrim()) {
      // 当前操作节点为1时则为移动裁剪框
      if (this.borderOption === 1) {
        // 计算要移动的x轴坐标
        const x = fixedData(
          currentX - (moveStartX - startX),
          width,
          this.screenShortController.width
        );
        // 计算要移动的y轴坐标
        const y = fixedData(
          currentY - (moveStartY - startY),
          height,
          this.screenShortController.height
        );
        // 重新绘制裁剪框
        this.tempGraphPosition = drawCutOutBox(
          x,
          y,
          width,
          height,
          context,
          this.data.getBorderSize(),
          this.screenShortController as HTMLCanvasElement,
          this.screenShortImageController
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
          this.screenShortController as HTMLCanvasElement,
          this.screenShortImageController
        ) as drawCutOutBoxReturnType;
      }
    }
  }

  /**
   * 显示最新的画布状态
   * @private
   */
  private showLastHistory() {
    if (this.screenShortCanvas != null) {
      const context = this.screenShortCanvas;
      if (this.data.getHistory().length <= 0) {
        this.addHistory();
      }
      context.putImageData(
        this.data.getHistory()[this.data.getHistory().length - 1]["data"],
        0,
        0
      );
    }
  }

  /**
   * 保存当前画布状态
   * @private
   */
  private addHistory() {
    if (this.screenShortCanvas != null && this.screenShortController != null) {
      // 获取canvas画布与容器
      const context = this.screenShortCanvas;
      const controller = this.screenShortController;
      if (this.data.getHistory().length > this.maxUndoNum) {
        // 删除最早的一条画布记录
        this.data.shiftHistory();
      }
      // 保存当前画布状态
      this.data.pushHistory({
        data: context.getImageData(0, 0, controller.width, controller.height)
      });
      // 启用撤销按钮
      this.data.setUndoStatus(true);
    }
  }
}
