import { isPC } from "@/lib/common-methods/DeviceTypeVerif";
import {
  handleGraffitiDraw,
  handleMouseDown,
  operatingCutOutBox,
  showToolBar
} from "@/lib/main-entrance/LoadCoreComponents";
import { nonNegativeData } from "@/lib/common-methods/FixedData";
import InitData from "@/lib/main-entrance/InitData";
import {
  cutOutBoxBorder,
  drawCutOutBoxReturnType,
  genericMethodPostbackType,
  movePositionType,
  positionInfoType,
  toolPositionValType
} from "@/lib/type/ComponentType";
import { getDrawBoundaryStatus } from "@/lib/split-methods/BoundaryJudgment";
import { drawCutOutBox } from "@/lib/split-methods/DrawCutOutBox";
import { addHistory } from "@/lib/split-methods/AddHistoryData";
import { saveBorderArrInfo } from "@/lib/common-methods/SaveBorderArrInfo";

const mouseDownCore = (
  event: MouseEvent | TouchEvent,
  data: InitData,
  containerInfo: {
    screenShotCanvas: CanvasRenderingContext2D | undefined;
    screenShotContainer: HTMLCanvasElement | null | undefined;
    screenShotImageController: HTMLCanvasElement;
    textInputController: HTMLDivElement | null | undefined;
  },
  containerVariable: {
    tempGraphPosition: positionInfoType;
    dpr: number;
    movePosition: movePositionType;
    cutOutBoxBorderArr: Array<cutOutBoxBorder>;
    borderOption: number | null;
    drawGraphPosition: positionInfoType;
    mouseInsideCropBox: boolean;
    textInputPosition: { mouseX: number; mouseY: number };
    position: { top: number; left: number };
  },
  containerFn: {
    croppingBoxCallerCallback: (res: genericMethodPostbackType) => void;
    saveDrawGraphCallerCallback: (res: genericMethodPostbackType) => void;
  }
) => {
  // 当前处于移动端触摸时，需要在按下时判断当前坐标点是否处于裁剪框内，主动更新draggingTrim状态（移动端的move事件只会在按下时才会触发）
  if (
    !isPC() &&
    event instanceof TouchEvent &&
    containerInfo.screenShotCanvas
  ) {
    operatingCutOutBox(
      event.touches[0].pageX,
      event.touches[0].pageY,
      containerVariable.tempGraphPosition.startX,
      containerVariable.tempGraphPosition.startY,
      containerVariable.tempGraphPosition.width,
      containerVariable.tempGraphPosition.height,
      containerInfo.screenShotCanvas,
      data,
      containerVariable.dpr,
      {
        screenShotContainer: containerInfo.screenShotContainer,
        screenShotImageController: containerInfo.screenShotImageController
      },
      {
        movePosition: containerVariable.movePosition,
        tempGraphPosition: containerVariable.tempGraphPosition,
        cutOutBoxBorderArr: containerVariable.cutOutBoxBorderArr,
        borderOption: containerVariable.borderOption
      },
      containerFn.croppingBoxCallerCallback
    );
  }
  // 当前操作的是撤销
  if (data.getToolName() == "undo") return;
  data.setDragging(true);
  // 重置工具栏超出状态
  data.setToolPositionStatus(false);
  const mouseX = nonNegativeData(
    event instanceof MouseEvent ? event.offsetX : event.touches[0].pageX
  );
  const mouseY = nonNegativeData(
    event instanceof MouseEvent ? event.offsetY : event.touches[0].pageY
  );
  handleMouseDown(
    data,
    containerVariable.drawGraphPosition,
    containerVariable.mouseInsideCropBox,
    containerVariable.textInputPosition,
    containerVariable.position,
    mouseX,
    mouseY,
    {
      textInputController: containerInfo.textInputController,
      screenShotContainer: containerInfo.screenShotContainer,
      screenShotCanvas: containerInfo.screenShotCanvas
    }
  );
  // 如果操作的是裁剪框
  if (containerVariable.borderOption) {
    // 设置为拖动状态
    data.setDraggingTrim(true);
    // 记录移动时的起始点坐标
    containerVariable.movePosition.moveStartX = mouseX;
    containerVariable.movePosition.moveStartY = mouseY;
  } else {
    containerFn.saveDrawGraphCallerCallback({
      code: 1,
      msg: "保存当前裁剪框的坐标",
      data: {
        drawGraphPrevX: containerVariable.drawGraphPosition.startX,
        drawGraphPrevY: containerVariable.drawGraphPosition.startY
      }
    });
    // 绘制裁剪框,记录当前鼠标开始坐标
    containerVariable.drawGraphPosition.startX = mouseX;
    containerVariable.drawGraphPosition.startY = mouseY;
  }
};
const mouseMoveCore = (
  event: MouseEvent | TouchEvent,
  data: InitData,
  containerInfo: {
    screenShotCanvas: CanvasRenderingContext2D;
    screenShotContainer: HTMLCanvasElement;
    screenShotImageController: HTMLCanvasElement;
    textInputController: HTMLDivElement | null | undefined;
  },
  containerVariable: {
    tempGraphPosition: positionInfoType;
    dpr: number;
    movePosition: movePositionType;
    cutOutBoxBorderArr: Array<cutOutBoxBorder>;
    borderOption: number | null;
    drawGraphPosition: positionInfoType;
    position: { top: number; left: number };
    drawStatus: boolean;
    degreeOfBlur: number;
    useRatioArrow: boolean;
  },
  containerFn: {
    showLastHistory: () => void;
    croppingBoxCallerCallback: (res: genericMethodPostbackType) => void;
    updateDragFlagCallback: (res: genericMethodPostbackType) => void;
    updateDrawStatusCallback: (res: genericMethodPostbackType) => void;
    updateTempGraphPositionCallback: (res: genericMethodPostbackType) => void;
  }
) => {
  /**
   * 调用视角
   *   // 鼠标移动事件
   *   private mouseMoveEvent2 = (event: MouseEvent | TouchEvent) => {
   *     if (
   *       this.screenShotCanvas == null ||
   *       this.screenShotContainer == null ||
   *       this.data.getToolName() == "undo"
   *     ) {
   *       return;
   *     }
   *     // 去除默认事件
   *     event.preventDefault();
   *
   *     const updateDragFlagCallback = (res: genericMethodPostbackType) => {
   *       if (res.code === 1 && typeof res.data === "boolean") {
   *         this.dragFlag = res.data;
   *       }
   *     };
   *     const updateDrawStatusCallback = (res: genericMethodPostbackType) => {
   *       if (res.code === 1 && typeof res.data === "boolean") {
   *         this.drawStatus = res.data;
   *       }
   *     };
   *     const updateTempGraphPositionCallback = (
   *       res: genericMethodPostbackType
   *     ) => {
   *       if (res.code === 1 && typeof res.data != null) {
   *         this.tempGraphPosition = res.data as drawCutOutBoxReturnType;
   *       }
   *     };
   *     mouseMoveCore(
   *       event,
   *       this.data,
   *       {
   *         screenShotCanvas: this.screenShotCanvas,
   *         screenShotContainer: this.screenShotContainer,
   *         screenShotImageController: this.screenShotImageController,
   *         textInputController: this.textInputController
   *       },
   *       {
   *         tempGraphPosition: this.tempGraphPosition,
   *         dpr: this.dpr,
   *         movePosition: this.movePosition,
   *         cutOutBoxBorderArr: this.cutOutBoxBorderArr,
   *         borderOption: this.borderOption,
   *         drawGraphPosition: this.drawGraphPosition,
   *         position: this.position,
   *         drawStatus: this.drawStatus,
   *         degreeOfBlur: this.degreeOfBlur,
   *         useRatioArrow: this.plugInParameters.getRatioArrow()
   *       },
   *       {
   *         showLastHistory: this.showLastHistory,
   *         croppingBoxCallerCallback: this.croppingBoxCallerCallback,
   *         updateDragFlagCallback,
   *         updateDrawStatusCallback,
   *         updateTempGraphPositionCallback
   *       }
   *     );
   *   };
   */

  // 工具栏未选择且鼠标处于按下状态时
  if (!data.getToolClickStatus() && data.getDragging()) {
    // 修改拖动状态为true;
    containerFn.updateDragFlagCallback({
      code: 1,
      msg: "更新拖动状态",
      data: true
    });
    // 隐藏截图工具栏
    data.setToolStatus(false);
    // 隐藏裁剪框尺寸显示容器
    data.setCutBoxSizeStatus(false);
  }
  // 获取当前绘制中的工具位置信息
  const { startX, startY, width, height } = containerVariable.drawGraphPosition;
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
  if (data.getToolClickStatus() && data.getDragging()) {
    // 获取裁剪框位置信息
    const cutBoxPosition = data.getCutOutBoxPosition();
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
    if (data.getToolName() != "mosaicPen") {
      containerFn.showLastHistory();
      containerFn.updateDrawStatusCallback({
        code: 1,
        msg: "更新绘制状态",
        data: true
      });
    }
    const callerCallback = (res: genericMethodPostbackType) => {
      if (res.code === 1 && res.data != null && typeof res.data === "boolean") {
        containerFn.updateDrawStatusCallback({
          code: 1,
          msg: "更新绘制状态",
          data: res.data
        });
      }
    };
    // 处理涂鸦绘制
    handleGraffitiDraw(
      containerVariable.drawStatus,
      startX,
      startY,
      tempWidth,
      tempHeight,
      currentX,
      currentY,
      containerVariable.degreeOfBlur,
      data,
      containerVariable.useRatioArrow,
      {
        screenShotCanvas: containerInfo.screenShotCanvas
      },
      { showLastHistory: containerFn.showLastHistory },
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
    containerInfo.screenShotCanvas,
    data,
    containerVariable.dpr,
    {
      screenShotContainer: containerInfo.screenShotContainer,
      screenShotImageController: containerInfo.screenShotImageController
    },
    {
      movePosition: containerVariable.movePosition,
      tempGraphPosition: containerVariable.tempGraphPosition,
      cutOutBoxBorderArr: containerVariable.cutOutBoxBorderArr,
      borderOption: containerVariable.borderOption
    },
    containerFn.croppingBoxCallerCallback
  );
  // 如果鼠标未点击或者当前操作的是裁剪框都return
  if (!data.getDragging() || data.getDraggingTrim()) return;
  // 绘制裁剪框
  const tempGraphPosition = drawCutOutBox(
    startX,
    startY,
    tempWidth,
    tempHeight,
    containerInfo.screenShotCanvas,
    data.getBorderSize(),
    containerInfo.screenShotContainer,
    containerInfo.screenShotImageController
  ) as drawCutOutBoxReturnType;
  containerFn.updateTempGraphPositionCallback({
    code: 1,
    msg: "更新tempGraphPosition的值",
    data: tempGraphPosition
  });
};
const mouseUpCore = (
  data: InitData,
  containerVariable: {
    dragFlag: boolean;
    drawStatus: boolean;
    clickCutFullScreen: boolean;
    drawGraphPosition: positionInfoType;
    cutOutBoxBorderArr: Array<cutOutBoxBorder>;
    drawGraphPrevX: number;
    drawGraphPrevY: number;
    tempGraphPosition: positionInfoType;
    placement: toolPositionValType;
    position: { top: number; left: number };
    fullScreenDiffHeight: number;
    getFullScreenStatus: boolean;
    dpr: number;
  },
  containerInfo: {
    screenShotCanvas: CanvasRenderingContext2D;
    screenShotContainer: HTMLCanvasElement;
    screenShotImageController: HTMLCanvasElement;
    toolController: HTMLDivElement | null | undefined;
  },
  containerFn: {
    toolBarCallerCallback: (res: genericMethodPostbackType) => void;
    updateTempGraphPositionCallback: (res: genericMethodPostbackType) => void;
    updateDrawStatusCallback: (res: genericMethodPostbackType) => void;
  }
) => {
  // 工具栏未点击且鼠标未拖动且单击截屏状态为false则复原裁剪框位置
  if (
    !data.getToolClickStatus() &&
    !containerVariable.dragFlag &&
    !containerVariable.clickCutFullScreen
  ) {
    // 复原裁剪框的坐标
    containerVariable.drawGraphPosition.startX =
      containerVariable.drawGraphPrevX;
    containerVariable.drawGraphPosition.startY =
      containerVariable.drawGraphPrevY;
    return;
  }

  // 调用者尚未拖拽生成选区
  // 鼠标尚未拖动
  // 单击截取屏幕状态为true
  // 则截取整个屏幕
  const cutBoxPosition = data.getCutOutBoxPosition();
  if (
    cutBoxPosition.width === 0 &&
    cutBoxPosition.height === 0 &&
    cutBoxPosition.startX === 0 &&
    cutBoxPosition.startY === 0 &&
    !containerVariable.dragFlag &&
    containerVariable.clickCutFullScreen
  ) {
    const borderSize = data.getBorderSize();
    containerFn.updateTempGraphPositionCallback({
      code: 1,
      msg: "更新getFullScreenStatus与tempGraphPosition",
      data: {
        getFullScreenStatus: true,
        tempGraphPosition: drawCutOutBox(
          0,
          0,
          containerInfo.screenShotContainer.width - borderSize / 2,
          containerInfo.screenShotContainer.height - borderSize / 2,
          containerInfo.screenShotCanvas,
          borderSize,
          containerInfo.screenShotContainer,
          containerInfo.screenShotImageController
        ) as drawCutOutBoxReturnType
      }
    });
    // this.getFullScreenStatus = true;
    // 设置裁剪框位置为全屏
    // this.tempGraphPosition = drawCutOutBox(
    //   0,
    //   0,
    //   this.screenShotContainer.width - borderSize / 2,
    //   this.screenShotContainer.height - borderSize / 2,
    //   this.screenShotCanvas,
    //   borderSize,
    //   this.screenShotContainer,
    //   this.screenShotImageController
    // ) as drawCutOutBoxReturnType;
  }

  if (
    containerInfo.screenShotContainer == null ||
    containerInfo.screenShotCanvas == null
  ) {
    return;
  }
  // 工具栏已点击且进行了绘制
  if (data.getToolClickStatus() && containerVariable.drawStatus) {
    // 保存绘制记录
    addHistory();
    return;
  } else if (data.getToolClickStatus() && !containerVariable.drawStatus) {
    // 工具栏点击了但尚未进行绘制
    return;
  }
  // 保存绘制后的图形位置信息
  Object.assign(
    containerVariable.drawGraphPosition,
    containerVariable.tempGraphPosition
  );
  // 如果工具栏未点击则保存裁剪框位置
  if (!data.getToolClickStatus()) {
    const {
      startX,
      startY,
      width,
      height
    } = containerVariable.drawGraphPosition;
    data.setCutOutBoxPosition(startX, startY, width, height);
  }
  // 保存边框节点信息
  Object.assign(
    containerVariable.cutOutBoxBorderArr,
    saveBorderArrInfo(data.getBorderSize(), containerVariable.drawGraphPosition)
  );
  // 鼠标按下且拖动时重新渲染工具栏
  if (
    (containerInfo.screenShotContainer != null && containerVariable.dragFlag) ||
    containerVariable.clickCutFullScreen
  ) {
    // 修改鼠标状态为拖动
    containerInfo.screenShotContainer.style.cursor = "move";
    // 显示截图工具栏
    data.setToolStatus(true);
    // 显示裁剪框尺寸显示容器
    data.setCutBoxSizeStatus(true);
    // 复原拖动状态
    containerFn.updateDrawStatusCallback({
      code: 1,
      msg: "更新dragFlag",
      data: false
    });
    if (containerInfo.toolController != null) {
      showToolBar(
        containerVariable.dpr,
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
  }
};

export { mouseDownCore, mouseMoveCore, mouseUpCore };
