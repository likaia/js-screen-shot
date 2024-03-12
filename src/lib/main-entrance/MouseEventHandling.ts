import { isPC } from "@/lib/common-methods/DeviceTypeVerif";
import {
  handleGraffitiDraw,
  handleMouseDown,
  operatingCutOutBox
} from "@/lib/main-entrance/LoadCoreComponents";
import { nonNegativeData } from "@/lib/common-methods/FixedData";
import InitData from "@/lib/main-entrance/InitData";
import {
  cutOutBoxBorder,
  drawCutOutBoxReturnType,
  genericMethodPostbackType,
  movePositionType,
  positionInfoType
} from "@/lib/type/ComponentType";
import { getDrawBoundaryStatus } from "@/lib/split-methods/BoundaryJudgment";
import { drawCutOutBox } from "@/lib/split-methods/DrawCutOutBox";

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
    event,
    data,
    containerVariable.drawGraphPosition,
    containerVariable.mouseInsideCropBox,
    containerVariable.textInputPosition,
    containerVariable.position,
    mouseX,
    mouseY,
    containerVariable.movePosition,
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
        // this.drawStatus = res.data;
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
const mouseUpCore = (event: MouseEvent | TouchEvent) => {};

export { mouseDownCore, mouseMoveCore, mouseUpCore };
