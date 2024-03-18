import InitData from "@/lib/main-entrance/InitData";
import { getCanvas2dCtx } from "@/lib/common-methods/CanvasPatch";
import { drawText } from "@/lib/split-methods/DrawText";
import { addHistory } from "@/lib/split-methods/AddHistoryData";
import {
  cutOutBoxBorder,
  drawCutOutBoxReturnType,
  genericMethodPostbackType,
  hideBarInfoType,
  movePositionType,
  positionInfoType,
  toolPositionValType,
  zoomCutOutBoxReturnType
} from "@/lib/type/ComponentType";
import { calculateToolLocation } from "@/lib/split-methods/CalculateToolLocation";
import html2canvas from "html2canvas";
import { drawCrossImg } from "@/lib/split-methods/drawCrossImg";
import { drawPencil, initPencil } from "@/lib/split-methods/DrawPencil";
import { drawRectangle } from "@/lib/split-methods/DrawRectangle";
import { drawCircle } from "@/lib/split-methods/DrawCircle";
import { drawLineArrow } from "@/lib/split-methods/DrawLineArrow";
import { DrawArrow } from "@/lib/split-methods/DrawArrow";
import { drawMosaic } from "@/lib/split-methods/DrawMosaic";
import { updateContainerMouseStyle } from "@/lib/common-methods/UpdateContainerMouseStyle";
import { fixedData } from "@/lib/common-methods/FixedData";
import { drawCutOutBox } from "@/lib/split-methods/DrawCutOutBox";
import { zoomCutOutBoxPosition } from "@/lib/common-methods/ZoomCutOutBoxPosition";
import { saveBorderArrInfo } from "@/lib/common-methods/SaveBorderArrInfo";
import { isPC } from "@/lib/common-methods/DeviceTypeVerif";

const registerForRightClickEvent = (
  container: HTMLElement,
  data: InitData,
  handleFn: (() => void) | undefined | null
) => {
  container.addEventListener("contextmenu", e => {
    e.preventDefault();
    // 调用者传入了自定义事件则执行
    if (handleFn) {
      handleFn();
      return;
    }
    // 销毁组件
    data.destroyDOM();
    data.setInitStatus(true);
  });
};

/**
 * 从窗口数据流中截取页面body内容
 * @param videoWidth 窗口宽度
 * @param videoHeight 窗口高度
 * @param containerWidth body内容宽度
 * @param containerHeight body内容高度
 * @param videoController
 * @param dpr
 * @private
 */
const getWindowContentData = (
  videoWidth: number,
  videoHeight: number,
  containerWidth: number,
  containerHeight: number,
  videoController: HTMLVideoElement,
  dpr: number
) => {
  const videoCanvas = document.createElement("canvas");
  videoCanvas.width = videoWidth;
  videoCanvas.height = videoHeight;
  const videoContext = getCanvas2dCtx(videoCanvas, videoWidth, videoHeight);
  if (videoContext) {
    videoContext.drawImage(videoController, 0, 0);
    const startX = 0;
    const startY = videoHeight - containerHeight;
    const width = containerWidth;
    const height = videoHeight - startY;
    // 获取裁剪框区域图片信息;
    return videoContext.getImageData(
      startX * dpr,
      startY * dpr,
      width * dpr,
      height * dpr
    );
  }
  return null;
};

const registerContainerShortcuts = (
  container: HTMLElement,
  screenShotCanvas: CanvasRenderingContext2D | null | undefined,
  data: InitData,
  textInputPosition: { mouseX: number; mouseY: number }
) => {
  container.addEventListener("keydown", (event: KeyboardEvent) => {
    if (screenShotCanvas == null) return;
    // command/ctrl + enter 将输入框的文字绘制到画布内
    // 按下ESC时如果有内容则绘制
    if (
      ((event.metaKey || event.ctrlKey) && event.code === "Enter") ||
      event.code === "Escape"
    ) {
      data.setTextEditState(true);
      const text = container.innerText;
      if (!text || text === "") {
        // 隐藏输入框
        data.setTextStatus(false);
        return;
      }
      drawText(
        text,
        textInputPosition.mouseX,
        textInputPosition.mouseY,
        data.getSelectedColor(),
        data.getFontSize(),
        screenShotCanvas
      );
      // 清空文本输入区域的内容
      container.innerHTML = "";
      // 隐藏输入框
      data.setTextStatus(false);
      // 保存绘制记录
      addHistory();
    }
  });
};

const showToolBar = (
  dpr: number,
  data: InitData,
  containerInfo: {
    toolController: HTMLDivElement | null | undefined;
    screenShotContainer: HTMLCanvasElement | null | undefined;
  },
  containerVariable: {
    drawGraphPosition: positionInfoType;
    placement: toolPositionValType;
    position: { top: number; left: number };
    fullScreenDiffHeight: number;
    getFullScreenStatus: boolean;
  },
  callerCallback: (res: genericMethodPostbackType) => void
) => {
  if (
    containerInfo.toolController == null ||
    containerInfo.screenShotContainer == null
  )
    return;
  const res: genericMethodPostbackType = { code: 0, data: null, msg: "" };
  // 计算截图工具栏位置
  const toolLocation = calculateToolLocation(
    containerVariable.drawGraphPosition,
    containerInfo.toolController.offsetWidth,
    containerInfo.screenShotContainer.width / dpr,
    containerVariable.placement,
    containerVariable.position
  );
  const containerHeight = containerInfo.screenShotContainer.height / dpr;

  // 工具栏的位置超出截图容器时，调整工具栏位置防止超出
  if (toolLocation.mouseY > containerHeight - 64) {
    toolLocation.mouseY -= containerVariable.drawGraphPosition.height + 64;
    // 超出屏幕顶部时
    if (toolLocation.mouseY < 0) {
      const containerHeight = parseInt(
        containerInfo.screenShotContainer.style.height
      );
      toolLocation.mouseY =
        containerHeight - containerVariable.fullScreenDiffHeight;
    }
    // 设置工具栏超出状态为true
    data.setToolPositionStatus(true);
    // 隐藏裁剪框尺寸显示容器
    data.setCutBoxSizeStatus(false);
  }

  // 当前截取的是全屏，则修改工具栏的位置到截图容器最底部，防止超出
  if (containerVariable.getFullScreenStatus) {
    const containerHeight = parseInt(
      containerInfo.screenShotContainer.style.height
    );
    // 重新计算工具栏的x轴位置
    const toolPositionX =
      (containerVariable.drawGraphPosition.width / dpr -
        containerInfo.toolController.offsetWidth) /
      2;
    toolLocation.mouseY =
      containerHeight - containerVariable.fullScreenDiffHeight;
    toolLocation.mouseX = toolPositionX;
  }

  // 显示并设置截图工具栏位置
  data.setToolInfo(
    toolLocation.mouseX + containerVariable.position.left,
    toolLocation.mouseY + containerVariable.position.top
  );

  // 设置裁剪框尺寸显示容器位置
  data.setCutBoxSizePosition(
    containerVariable.drawGraphPosition.startX,
    containerVariable.drawGraphPosition.startY - 35
  );
  // 渲染裁剪框尺寸
  data.setCutBoxSize(
    containerVariable.drawGraphPosition.width,
    containerVariable.drawGraphPosition.height
  );

  // 状态重置
  res.code = 1;
  res.data = false;
  callerCallback(res);
};

const drawPictures = (
  imgSrc: string,
  screenShotImageController: HTMLCanvasElement,
  callerCallback: (res: genericMethodPostbackType) => void
) => {
  const imgContainer = new Image();
  const res: genericMethodPostbackType = {
    code: 0,
    data: null,
    msg: ""
  };

  imgContainer.src = imgSrc;
  imgContainer.width = screenShotImageController.width;
  imgContainer.height = screenShotImageController.height;
  imgContainer.crossOrigin = "Anonymous";
  imgContainer.onload = () => {
    // 将用户传递的图片绘制到图片容器里
    screenShotImageController
      .getContext("2d")
      ?.drawImage(
        imgContainer,
        0,
        0,
        screenShotImageController.width,
        screenShotImageController.height
      );
    // 初始化截图容器
    res.code = 1;
    callerCallback(res);
  };
};

const setScreenShotContainerSize = (
  screenShotImageController: HTMLCanvasElement,
  data: InitData,
  canvasSize: {
    canvasWidth: number;
    canvasHeight: number;
  },
  viewSize: { width: number; height: number },
  position: { left: number; top: number }
) => {
  // 设置截图区域canvas宽高
  data.setScreenShotInfo(viewSize.width, viewSize.height);
  // 设置截图容器位置
  data.setScreenShotPosition(position.left, position.top);
  // 设置截图图片存放容器宽高
  screenShotImageController.width = viewSize.width;
  screenShotImageController.height = viewSize.height;
  // 用户有传宽高则使用用户传进来的
  if (canvasSize.canvasWidth !== 0 && canvasSize.canvasHeight !== 0) {
    data.setScreenShotInfo(canvasSize.canvasWidth, canvasSize.canvasHeight);
    screenShotImageController.width = canvasSize.canvasWidth;
    screenShotImageController.height = canvasSize.canvasHeight;
  }
};

const h2cScreenShot = (
  triggerCallback: Function | undefined,
  screenShotDom: HTMLElement | HTMLCanvasElement | HTMLDivElement | null,
  loadCrossImg: boolean,
  proxyUrl: string | undefined
): Promise<{ code: number; data: { canvas: HTMLCanvasElement } }> => {
  return new Promise((resolve, reject) => {
    html2canvas(screenShotDom ? screenShotDom : document.body, {
      onclone: loadCrossImg ? drawCrossImg : undefined,
      proxy: proxyUrl
    })
      .then(canvas => {
        resolve({ code: 0, data: { canvas } });
      })
      .catch(err => {
        const msg = { code: -1, msg: err };
        if (triggerCallback != null) {
          // 获取页面元素成功，执行回调函数
          triggerCallback(msg);
        }
        reject(msg);
      });
  });
};

const getContainerSize = (
  canvasSize: {
    canvasWidth: number;
    canvasHeight: number;
  },
  screenShotImageController: HTMLCanvasElement,
  wrcWindowMode: boolean,
  dpr: number
) => {
  let containerWidth = screenShotImageController?.width;
  let containerHeight = screenShotImageController?.height;
  // 用户有传宽高时，则使用用户的
  if (canvasSize.canvasWidth !== 0 && canvasSize.canvasHeight !== 0) {
    containerWidth = canvasSize.canvasWidth;
    containerHeight = canvasSize.canvasHeight;
  }
  let imgContainerWidth = containerWidth;
  let imgContainerHeight = containerHeight;
  if (wrcWindowMode) {
    imgContainerWidth = containerWidth * dpr;
    imgContainerHeight = containerHeight * dpr;
  }
  return {
    containerWidth,
    containerHeight,
    imgContainerWidth,
    imgContainerHeight
  };
};

const fixWrcSize = (
  containerWidth: number,
  containerHeight: number,
  videoWidth: number,
  videoHeight: number,
  wrcImgPosition: { x: number; y: number; w: number; h: number },
  imgContext: CanvasRenderingContext2D,
  videoController: HTMLVideoElement,
  hiddenScrollBar: hideBarInfoType
) => {
  let fixWidth = containerWidth;
  let fixHeight = (videoHeight * containerWidth) / videoWidth;
  if (fixHeight > containerHeight) {
    fixWidth = (containerWidth * containerHeight) / fixHeight;
    fixHeight = containerHeight;
  }
  // 对视频容器的内容进行裁剪
  fixWidth = wrcImgPosition.w > 0 ? wrcImgPosition.w : fixWidth;
  fixHeight = wrcImgPosition.h > 0 ? wrcImgPosition.h : fixHeight;
  imgContext?.drawImage(
    videoController,
    wrcImgPosition.x,
    wrcImgPosition.y,
    fixWidth,
    fixHeight
  );
  // 隐藏滚动条会出现部分内容未截取到，需要进行修复
  const diffHeight = containerHeight - fixHeight;
  if (hiddenScrollBar.state && diffHeight > 0 && hiddenScrollBar.fillState) {
    // 填充容器的剩余部分
    imgContext.beginPath();
    let fillWidth = containerWidth;
    let fillHeight = diffHeight;
    if (hiddenScrollBar?.fillWidth && hiddenScrollBar.fillWidth > 0) {
      fillWidth = hiddenScrollBar.fillWidth;
    }
    if (hiddenScrollBar?.fillHeight && hiddenScrollBar.fillHeight > 0) {
      fillHeight = hiddenScrollBar.fillHeight;
    }
    imgContext.rect(0, fixHeight, fillWidth, fillHeight);
    imgContext.fillStyle = hiddenScrollBar.color || "";
    imgContext.fill();
  }
};

const getDisplayMediaConfig = (
  screenShotImageController: HTMLCanvasElement,
  dpr: number,
  wrcWindowMode: boolean
) => {
  let mediaWidth = screenShotImageController.width * dpr;
  let mediaHeight = screenShotImageController.height * dpr;
  let curTabState = true;
  let displayConfig = {};
  // 窗口模式启用时则
  if (wrcWindowMode) {
    mediaWidth = window.screen.width * dpr;
    mediaHeight = window.screen.height * dpr;
    curTabState = false;
    displayConfig = {
      displaySurface: "window"
    };
  }
  return {
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
  };
};

const handleMouseDown = (
  data: InitData,
  drawGraphPosition: positionInfoType,
  mouseInsideCropBox: boolean,
  textInputPosition: { mouseX: number; mouseY: number },
  position: { top: number; left: number },
  mouseX: number,
  mouseY: number,
  containerInfo: {
    textInputController?: HTMLDivElement | null | undefined;
    screenShotContainer?: HTMLCanvasElement | null | undefined;
    screenShotCanvas?: CanvasRenderingContext2D;
  }
) => {
  // 如果当前操作的是截图工具栏
  if (data.getToolClickStatus()) {
    // 记录当前鼠标开始坐标
    drawGraphPosition.startX = mouseX;
    drawGraphPosition.startY = mouseY;
  }
  // 当前操作的是画笔
  if (data.getToolName() == "brush" && containerInfo.screenShotCanvas) {
    // 初始化画笔
    initPencil(containerInfo.screenShotCanvas, mouseX, mouseY);
  }
  // 当前操作的文本
  if (
    data.getToolName() == "text" &&
    containerInfo.textInputController &&
    containerInfo.screenShotContainer &&
    containerInfo.screenShotCanvas
  ) {
    if (!mouseInsideCropBox) {
      return;
    }
    // 显示文本输入区域
    data.setTextStatus(true);
    // 判断输入框位置是否变化
    if (
      textInputPosition.mouseX != 0 &&
      textInputPosition.mouseY != 0 &&
      textInputPosition.mouseX != mouseX &&
      textInputPosition.mouseY != mouseY
    ) {
      drawText(
        containerInfo.textInputController.innerText,
        textInputPosition.mouseX,
        textInputPosition.mouseY,
        data.getSelectedColor(),
        data.getFontSize(),
        containerInfo.screenShotCanvas
      );

      // 输入框内容不为空时则隐藏
      if (containerInfo.textInputController.innerText !== "") {
        // 隐藏输入框
        data.setTextStatus(false);
      }

      // 清空文本输入区域的内容
      containerInfo.textInputController.innerHTML = "";
      // 保存绘制记录
      addHistory();
    }
    // 计算文本框显示位置, 需要加上截图容器的位置信息
    const textMouseX = mouseX + position.left;
    // 设置文本框位置等信息
    containerInfo.textInputController.style.left = textMouseX + "px";
    containerInfo.textInputController.style.fontSize =
      data.getFontSize() + "px";
    containerInfo.textInputController.style.fontFamily = "none";
    containerInfo.textInputController.style.color = data.getSelectedColor();

    // 部分操作需要等dom渲染完毕执行
    setTimeout(() => {
      if (containerInfo.textInputController) {
        // 获取输入框容器的高度
        const containerHeight = containerInfo.textInputController.offsetHeight;
        // 输入框容器y轴的位置需要在坐标的基础上再加上容器高度的一半，容器的位置就正好居中于光标
        // canvas渲染的时候就不会出现位置不一致的问题了
        const textMouseY =
          mouseY - Math.floor(containerHeight / 2) + position.top;
        containerInfo.textInputController.style.top = textMouseY + "px";
        // 获取焦点
        containerInfo.textInputController.focus();
        // 记录当前输入框位置
        textInputPosition.mouseX = mouseX;
        textInputPosition.mouseY = mouseY;
        data.setTextInfo({
          positionX: mouseX,
          positionY: mouseY,
          color: data.getSelectedColor(),
          size: data.getFontSize()
        });
      }
    });
  }
};

const handleGraffitiDraw = (
  drawStatus: boolean,
  startX: number,
  startY: number,
  tempWidth: number,
  tempHeight: number,
  currentX: number,
  currentY: number,
  degreeOfBlur: number,
  data: InitData,
  useRatioArrow: boolean,
  containerInfo: {
    screenShotCanvas: CanvasRenderingContext2D;
  },
  containerFn: {
    showLastHistory: () => void;
  },
  callerCallback: (res: genericMethodPostbackType) => void
) => {
  const res: genericMethodPostbackType = {
    code: 0,
    data: null,
    msg: ""
  };
  switch (data.getToolName()) {
    case "square":
      drawRectangle(
        startX,
        startY,
        tempWidth,
        tempHeight,
        data.getSelectedColor(),
        data.getPenSize(),
        containerInfo.screenShotCanvas
      );
      break;
    case "round":
      drawCircle(
        containerInfo.screenShotCanvas,
        currentX,
        currentY,
        startX,
        startY,
        data.getPenSize(),
        data.getSelectedColor()
      );
      break;
    case "right-top":
      // 绘制等比例箭头
      if (useRatioArrow) {
        drawLineArrow(
          containerInfo.screenShotCanvas,
          startX,
          startY,
          currentX,
          currentY,
          30,
          10,
          data.getPenSize(),
          data.getSelectedColor()
        );
        break;
      }
      // 绘制递增变粗箭头
      new DrawArrow().draw(
        containerInfo.screenShotCanvas,
        startX,
        startY,
        currentX,
        currentY,
        data.getSelectedColor(),
        data.getPenSize()
      );
      break;
    case "brush":
      // 画笔绘制
      drawPencil(
        containerInfo.screenShotCanvas,
        currentX,
        currentY,
        data.getPenSize(),
        data.getSelectedColor()
      );
      break;
    case "mosaicPen":
      // 当前为马赛克工具则修改绘制状态
      // 前面做了判断，此处需要特殊处理
      if (!drawStatus) {
        containerFn.showLastHistory();
        // 返回一个特殊值，用于修改调用组件的内部状态
        res.code = 1;
        res.data = true;
        res.msg = "需要更新组件状态";
        callerCallback(res);
      }
      // 绘制马赛克，为了确保鼠标位置在绘制区域中间，所以对x、y坐标进行-10处理
      drawMosaic(
        currentX - 10,
        currentY - 10,
        data.getMosaicPenSize(),
        degreeOfBlur,
        containerInfo.screenShotCanvas
      );
      break;
    default:
      break;
  }
  return res;
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
 * @param data
 * @param dpr
 * @param containerInfo
 * @param containerVariable
 * @param callerCallback
 * @private
 */
const operatingCutOutBox = (
  currentX: number,
  currentY: number,
  startX: number,
  startY: number,
  width: number,
  height: number,
  context: CanvasRenderingContext2D,
  data: InitData,
  dpr: number,
  containerInfo: {
    screenShotContainer: HTMLCanvasElement | null | undefined;
    screenShotImageController: HTMLCanvasElement;
  },
  containerVariable: {
    movePosition: movePositionType;
    cutOutBoxBorderArr: Array<cutOutBoxBorder>;
    borderOption: number | null;
  },
  callerCallback: (res: genericMethodPostbackType) => void
) => {
  const res: genericMethodPostbackType = { code: 0, msg: "", data: null };
  // canvas元素不存在
  if (containerInfo.screenShotContainer == null) {
    return;
  }
  // 获取鼠标按下时的坐标
  const { moveStartX, moveStartY } = containerVariable.movePosition;

  // 裁剪框边框节点事件存在且裁剪框未进行操作，则对鼠标样式进行修改
  if (
    containerVariable.cutOutBoxBorderArr.length > 0 &&
    !data.getDraggingTrim()
  ) {
    // 标识鼠标是否在裁剪框内
    let flag = false;
    // 判断鼠标位置
    context.beginPath();
    for (let i = 0; i < containerVariable.cutOutBoxBorderArr.length; i++) {
      context.rect(
        containerVariable.cutOutBoxBorderArr[i].x,
        containerVariable.cutOutBoxBorderArr[i].y,
        containerVariable.cutOutBoxBorderArr[i].width,
        containerVariable.cutOutBoxBorderArr[i].height
      );
      // 当前坐标点处于8个可操作点上，修改鼠标指针样式
      if (context.isPointInPath(currentX * dpr, currentY * dpr)) {
        switch (containerVariable.cutOutBoxBorderArr[i].index) {
          case 1:
            if (data.getToolClickStatus()) {
              // 修改截图容器内的鼠标样式
              updateContainerMouseStyle(
                containerInfo.screenShotContainer,
                data.getActiveToolName()
              );
            } else {
              containerInfo.screenShotContainer.style.cursor = "move";
            }
            break;
          case 2:
            // 工具栏被点击则不改变指针样式
            if (data.getToolClickStatus()) break;
            containerInfo.screenShotContainer.style.cursor = "ns-resize";
            break;
          case 3:
            if (data.getToolClickStatus()) break;
            containerInfo.screenShotContainer.style.cursor = "ew-resize";
            break;
          case 4:
            if (data.getToolClickStatus()) break;
            containerInfo.screenShotContainer.style.cursor = "nwse-resize";
            break;
          case 5:
            if (data.getToolClickStatus()) break;
            containerInfo.screenShotContainer.style.cursor = "nesw-resize";
            break;
          default:
            break;
        }
        res.code = 1;
        res.data = containerVariable.cutOutBoxBorderArr[i].option;
        res.msg = "修改borderOption的值";
        callerCallback(res);
        flag = true;
        break;
      }
    }
    res.code = 2;
    res.data = flag;
    res.msg = "修改mouseInsideCropBox的值";
    callerCallback(res);
    context.closePath();
    if (!flag) {
      // 鼠标移出裁剪框重置鼠标样式
      containerInfo.screenShotContainer.style.cursor = "default";
      // 重置当前操作的边框节点为null
      res.code = 3;
      res.data = null;
      res.msg = "重置borderOption的值";
      callerCallback(res);
    }
  }

  // 裁剪框正在被操作
  if (data.getDraggingTrim()) {
    // 当前操作节点为1时则为移动裁剪框
    if (containerVariable.borderOption === 1) {
      // 计算要移动的x轴坐标
      let x = fixedData(
        currentX - (moveStartX - startX),
        width,
        containerInfo.screenShotContainer.width
      );
      // 计算要移动的y轴坐标
      let y = fixedData(
        currentY - (moveStartY - startY),
        height,
        containerInfo.screenShotContainer.height
      );
      // 计算画布面积
      const containerWidth = containerInfo.screenShotContainer.width / dpr;
      const containerHeight = containerInfo.screenShotContainer.height / dpr;
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
      res.code = 5;
      res.msg = "重新绘制裁剪框, 修改tempGraphPosition的值";
      res.data = drawCutOutBox(
        x,
        y,
        width,
        height,
        context,
        data.getBorderSize(),
        containerInfo.screenShotContainer,
        containerInfo.screenShotImageController
      ) as drawCutOutBoxReturnType;
      callerCallback(res);
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
        containerVariable.borderOption as number
      ) as zoomCutOutBoxReturnType;
      // 绘制裁剪框

      res.code = 4;
      res.msg = "修改tempGraphPosition的值";
      res.data = drawCutOutBox(
        tempStartX,
        tempStartY,
        tempWidth,
        tempHeight,
        context,
        data.getBorderSize(),
        containerInfo.screenShotContainer as HTMLCanvasElement,
        containerInfo.screenShotImageController
      ) as drawCutOutBoxReturnType;
      callerCallback(res);
    }
  }
};

// 调整插件容器层级
const adjustContainerLevels = (
  level: number,
  containerInfo: {
    screenShotContainer: HTMLCanvasElement | null | undefined;
    toolController: HTMLDivElement | null | undefined;
    textInputController: HTMLDivElement | null | undefined;
    optionIcoController: HTMLDivElement | null | undefined;
    optionController: HTMLDivElement | null | undefined;
    cutBoxSizeContainer: HTMLDivElement | null | undefined;
  }
) => {
  if (
    containerInfo.screenShotContainer == null ||
    containerInfo.toolController == null ||
    containerInfo.textInputController == null ||
    containerInfo.optionIcoController == null ||
    containerInfo.optionController == null ||
    containerInfo.cutBoxSizeContainer == null ||
    level <= 0
  ) {
    return;
  }
  containerInfo.screenShotContainer.style.zIndex = `${level}`;
  containerInfo.toolController.style.zIndex = `${level + 1}`;
  containerInfo.textInputController.style.zIndex = `${level + 1}`;
  containerInfo.optionIcoController.style.zIndex = `${level + 1}`;
  containerInfo.optionController.style.zIndex = `${level + 1}`;
  containerInfo.cutBoxSizeContainer.style.zIndex = `${level + 1}`;
};

// 初始化裁剪框
const initCropBox = (
  dpr: number,
  cropBoxInfo: {
    x: number;
    y: number;
    w: number;
    h: number;
  },
  data: InitData,
  containerInfo: {
    screenShotContainer: HTMLCanvasElement | null | undefined;
    screenShotImageController: HTMLCanvasElement;
    screenShotCanvas: CanvasRenderingContext2D;
    toolController: HTMLDivElement | null | undefined;
  },
  containerVariable: {
    drawGraphPosition: positionInfoType;
    cutOutBoxBorderArr: Array<cutOutBoxBorder>;
    placement: toolPositionValType;
    position: { top: number; left: number };
    fullScreenDiffHeight: number;
    getFullScreenStatus: boolean;
  },
  containerFn: {
    toolBarCallerCallback: (res: genericMethodPostbackType) => void;
  }
) => {
  const startX = cropBoxInfo.x;
  const startY = cropBoxInfo.y;
  const width = cropBoxInfo.w;
  const height = cropBoxInfo.h;
  if (containerInfo.screenShotContainer == null) return;
  containerVariable.drawGraphPosition.startX = startX;
  containerVariable.drawGraphPosition.startY = startY;
  containerVariable.drawGraphPosition.width = width;
  containerVariable.drawGraphPosition.height = height;
  data.setCutOutBoxPosition(startX, startY, width, height);
  drawCutOutBox(
    startX,
    startY,
    width,
    height,
    containerInfo.screenShotCanvas,
    data.getBorderSize(),
    containerInfo.screenShotContainer,
    containerInfo.screenShotImageController
  );
  // 保存边框节点信息
  containerVariable.cutOutBoxBorderArr.length = 0;
  containerVariable.cutOutBoxBorderArr.push(
    ...saveBorderArrInfo(
      data.getBorderSize(),
      containerVariable.drawGraphPosition
    )
  );
  // 修改鼠标状态为拖动
  containerInfo.screenShotContainer.style.cursor = "move";
  // 显示截图工具栏
  data.setToolStatus(true);
  // 显示裁剪框尺寸显示容器
  data.setCutBoxSizeStatus(true);
  if (containerInfo.toolController != null) {
    // 渲染截图工具栏
    showToolBar(
      dpr,
      data,
      {
        toolController: containerInfo.toolController,
        screenShotContainer: containerInfo.screenShotContainer
      },
      {
        drawGraphPosition: containerVariable.drawGraphPosition,
        placement: containerVariable.placement,
        position: containerVariable.position,
        fullScreenDiffHeight: containerVariable.fullScreenDiffHeight,
        getFullScreenStatus: containerVariable.getFullScreenStatus
      },
      containerFn.toolBarCallerCallback
    );
  }
};

// 为截图容器添加鼠标||触摸的事件监听
const setScreenShotContainerEventListener = (
  screenShotContainer: HTMLCanvasElement | null | undefined,
  containerFn: {
    mouseDownEvent: (event: MouseEvent | TouchEvent) => void;
    mouseMoveEvent: (event: MouseEvent | TouchEvent) => void;
    mouseUpEvent: (event: MouseEvent | TouchEvent) => void;
  }
) => {
  if (isPC()) {
    // 添加鼠标事件监听
    screenShotContainer?.addEventListener(
      "mousedown",
      containerFn.mouseDownEvent
    );
    screenShotContainer?.addEventListener(
      "mousemove",
      containerFn.mouseMoveEvent
    );
    screenShotContainer?.addEventListener("mouseup", containerFn.mouseUpEvent);
    return;
  }
  // 设置触摸监听
  screenShotContainer?.addEventListener(
    "touchstart",
    containerFn.mouseDownEvent,
    false
  );
  screenShotContainer?.addEventListener(
    "touchmove",
    containerFn.mouseMoveEvent,
    false
  );
  screenShotContainer?.addEventListener(
    "touchend",
    containerFn.mouseUpEvent,
    false
  );
};

const sendStream = (
  stream: MediaStream | null,
  cancelCallback: Function | undefined,
  triggerCallback: Function | undefined,
  data: InitData,
  containerInfo: {
    videoController: HTMLVideoElement;
  },
  containerFn: {
    loadScreenFlowData: (triggerCallback: Function | undefined) => void;
  }
) => {
  if (stream instanceof MediaStream) {
    containerInfo.videoController.srcObject = stream;
    containerFn.loadScreenFlowData(triggerCallback);
  } else {
    if (cancelCallback != null) {
      cancelCallback({
        code: -1,
        msg: "视频流接入失败"
      });
    }
    // 销毁截图组件
    data.destroyDOM();
    throw `视频流接入失败`;
  }
  return stream;
};

// 开始捕捉屏幕
const startCapture = async (
  cancelCallback: Function | undefined,
  data: InitData,
  containerInfo: {
    screenShotImageController: HTMLCanvasElement;
    videoController: HTMLVideoElement;
  },
  containerVariable: {
    dpr: number;
    wrcWindowMode: boolean;
  },
  callerCallback: (res: genericMethodPostbackType) => void
) => {
  let captureStream = null;

  try {
    // 捕获屏幕
    captureStream = await navigator.mediaDevices.getDisplayMedia(
      getDisplayMediaConfig(
        containerInfo.screenShotImageController,
        containerVariable.dpr,
        containerVariable.wrcWindowMode
      )
    );
    // 将MediaStream输出至video标签
    containerInfo.videoController.srcObject = captureStream;
    // 储存屏幕流数据
    callerCallback({
      code: 1,
      data: captureStream,
      msg: "更新captureStream数据"
    });
  } catch (err) {
    const msg = "浏览器不支持webrtc或者用户未授权";
    if (cancelCallback != null) {
      cancelCallback({
        code: -1,
        msg,
        errorInfo: err
      });
    }
    // 销毁截图组件
    data.destroyDOM();
    throw `${msg}( ${err} )`;
  }
  return captureStream;
};

// 停止捕捉屏幕
const stopCapture = (videoController: HTMLVideoElement) => {
  const srcObject = videoController.srcObject;
  if (srcObject && "getTracks" in srcObject) {
    const tracks = srcObject.getTracks();
    tracks.forEach(track => track.stop());
    videoController.srcObject = null;
  }
};

export {
  registerForRightClickEvent,
  getWindowContentData,
  registerContainerShortcuts,
  showToolBar,
  drawPictures,
  setScreenShotContainerSize,
  h2cScreenShot,
  getContainerSize,
  fixWrcSize,
  getDisplayMediaConfig,
  handleMouseDown,
  handleGraffitiDraw,
  operatingCutOutBox,
  adjustContainerLevels,
  initCropBox,
  setScreenShotContainerEventListener,
  sendStream,
  startCapture,
  stopCapture
};
