/**
 * 裁剪框工具栏点击事件
 */
import { setSelectedClassName } from "@/lib/common-methods/SetSelectedClassName";
import { calculateOptionIcoPosition } from "@/lib/split-methods/CalculateOptionIcoPosition";
import InitData from "@/lib/main-entrance/InitData";
import { getCanvasImgData } from "@/lib/common-methods/GetCanvasImgData";
import { takeOutHistory } from "@/lib/common-methods/TakeOutHistory";
import { drawCutOutBox } from "@/lib/split-methods/DrawCutOutBox";
import { drawText } from "@/lib/split-methods/DrawText";
import { addHistory } from "@/lib/split-methods/AddHistoryData";
import PlugInParameters from "@/lib/main-entrance/PlugInParameters";
import { userToolbarFnType } from "@/lib/type/ComponentType";

function getToolbarContainer() {
  const data = new InitData();
  const textInputController = data.getTextInputController();
  const screenShotController = data.getScreenShotContainer();
  const ScreenShotImageController = data.getScreenShotImageController();
  if (screenShotController == null || ScreenShotImageController == null)
    return null;
  const screenShotCanvas = screenShotController.getContext(
    "2d"
  ) as CanvasRenderingContext2D;
  return {
    textInputController,
    screenShotController,
    ScreenShotImageController,
    screenShotCanvas
  };
}

// 隐藏文本输入框
function hideTextInput(
  toolName: string,
  screenShotCanvas: CanvasRenderingContext2D
) {
  const data = new InitData();
  const textInputController = data.getTextInputController();
  if (
    (textInputController != null && data.getTextStatus()) ||
    (textInputController != null && toolName !== "text")
  ) {
    const text = textInputController.innerText;
    if (text && text !== "") {
      const { positionX, positionY, color, size } = data.getTextInfo();
      drawText(text, positionX, positionY, color, size, screenShotCanvas);
      // 添加历史记录
      addHistory();
    }
    textInputController.innerHTML = "";
    data.setTextStatus(false);
  }
}

// 绘制无像素点的裁剪框
function drawCutOutBoxWithoutPixel(
  screenShotCanvas: CanvasRenderingContext2D,
  screenShotController: HTMLCanvasElement,
  ScreenShotImageController: HTMLCanvasElement
) {
  const data = new InitData();
  const leftValue = data.getToolPosition()?.left || 0;
  const topValue = data.getToolPosition()?.top || 0;
  // 工具栏位置超出时，对其进行修正处理
  if (topValue && data.getToolPositionStatus()) {
    // 调整工具栏位置
    data.setToolInfo(leftValue, topValue - 46);
  }
  data.setToolStatus(true);
  // 获取裁剪框位置信息
  const cutBoxPosition = data.getCutOutBoxPosition();
  // 开始绘制无像素点裁剪框
  drawCutOutBox(
    cutBoxPosition.startX,
    cutBoxPosition.startY,
    cutBoxPosition.width,
    cutBoxPosition.height,
    screenShotCanvas,
    data.getBorderSize(),
    screenShotController as HTMLCanvasElement,
    ScreenShotImageController,
    false
  );
}

export function toolClickEvent(
  toolName: string,
  index: number,
  mouseEvent: any,
  completeCallback: Function | undefined,
  closeCallback: Function | undefined
) {
  const data = new InitData();
  const plugInParameters = new PlugInParameters();
  data.setActiveToolName(toolName);
  data.setToolId(index);
  const toolBarContainer = getToolbarContainer();
  if (toolBarContainer == null) {
    return;
  }
  const {
    screenShotController,
    ScreenShotImageController,
    screenShotCanvas
  } = toolBarContainer;
  // 工具栏尚未点击，当前属于首次点击，重新绘制一个无像素点的裁剪框
  if (!data.getToolClickStatus()) {
    drawCutOutBoxWithoutPixel(
      screenShotCanvas,
      screenShotController,
      ScreenShotImageController
    );
  }
  // 更新当前点击的工具栏条目
  data.setToolName(toolName);
  // 为当前点击项添加选中时的class名
  setSelectedClassName(mouseEvent, index, false);
  if (toolName === "text") {
    // 显示文字选择容器
    data.setTextSizePanelStatus(true);
    // 隐藏画笔尺寸选择容器
    data.setBrushSelectionStatus(false);
    // 颜色选择容器添加布局兼容样式
    data.getColorSelectPanel()?.classList.add("text-select-status");
  } else {
    // 隐藏下拉选择框
    data.setTextSizePanelStatus(false);
    // 显示画笔尺寸选择容器
    data.setBrushSelectionStatus(true);
  }
  // 显示选项面板
  data.setOptionStatus(true);
  // 设置选项面板位置
  data.setOptionPosition(calculateOptionIcoPosition(index));
  data.setRightPanel(true);
  if (toolName == "mosaicPen") {
    // 马赛克工具隐藏右侧颜色面板与角标
    data.setRightPanel(false);
    data.hiddenOptionIcoStatus();
  }
  // 清空文本输入区域的内容并隐藏文本输入框
  hideTextInput(toolName, screenShotCanvas);
  // 初始化点击状态
  data.setDragging(false);
  data.setDraggingTrim(false);

  // 保存图片
  if (toolName == "save") {
    getCanvasImgData(true);
    const callback = plugInParameters.getSaveCallback();
    if (callback) {
      callback(0, "保存成功");
    }
    // 销毁组件
    data.destroyDOM();
    data.setInitStatus(true);
  }
  // 销毁组件
  if (toolName == "close") {
    // 触发关闭回调函数
    if (closeCallback) {
      closeCallback();
    }
    data.destroyDOM();
    data.setInitStatus(true);
  }
  // 确认截图
  if (toolName == "confirm") {
    const base64 = getCanvasImgData(false);
    // 触发回调函数，截图数据回传给插件调用者
    if (completeCallback) {
      completeCallback({ base64, cutInfo: data.getCutOutBoxPosition() });
    }
    if (!plugInParameters.getDestroyContainerState()) {
      // 隐藏工具栏
      data.setToolStatus(false);
      data.setOptionStatus(false);
      return;
    }
    // 销毁组件
    data.destroyDOM();
    data.setInitStatus(true);
  }
  // 撤销
  if (toolName == "undo") {
    // 隐藏画笔选项工具栏
    data.setOptionStatus(false);
    takeOutHistory();
  }

  // 设置裁剪框工具栏为点击状态
  data.setToolClickStatus(true);
}

// 处理用户自定义工具栏的点击事件
export function toolClickEventForUserDefined(
  index: number,
  toolName: string,
  activeIcon: string,
  clickFn: userToolbarFnType,
  mouseEvent: MouseEvent
) {
  const data = new InitData();
  data.setActiveToolName(toolName);
  data.setToolId(index);
  const target = mouseEvent.target as HTMLDivElement;
  target.style.backgroundImage = `url(${activeIcon})`;
  const toolBarContainer = getToolbarContainer();
  if (toolBarContainer == null) {
    return;
  }
  const {
    screenShotController,
    ScreenShotImageController,
    screenShotCanvas
  } = toolBarContainer;
  // 工具栏尚未点击，当前属于首次点击，重新绘制一个无像素点的裁剪框
  if (!data.getToolClickStatus()) {
    drawCutOutBoxWithoutPixel(
      screenShotCanvas,
      screenShotController,
      ScreenShotImageController
    );
  }
  clickFn({
    screenShotCanvas,
    screenShotController,
    ScreenShotImageController
  });
  data.setToolName(toolName);
  setSelectedClassName(mouseEvent, Number.MAX_VALUE, false);
  // 隐藏选项面板
  data.setOptionStatus(false);
  hideTextInput(toolName, screenShotCanvas);
  // 初始化点击状态
  data.setDragging(false);
  data.setDraggingTrim(false);
  // 设置裁剪框工具栏为点击状态
  data.setToolClickStatus(true);
}
