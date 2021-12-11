/**
 * 裁剪框工具栏点击事件
 * @param toolName
 * @param index
 * @param mouseEvent
 */
import { setSelectedClassName } from "@/lib/common-methords/SetSelectedClassName";
import { calculateOptionIcoPosition } from "@/lib/split-methods/CalculateOptionIcoPosition";
import InitData from "@/lib/main-entrance/InitData";
import { getCanvasImgData } from "@/lib/common-methords/GetCanvasImgData";
import { takeOutHistory } from "@/lib/common-methords/TakeOutHistory";
import { drawCutOutBox } from "@/lib/split-methods/DrawCutOutBox";

export function toolClickEvent(
  toolName: string,
  index: number,
  mouseEvent: any,
  completeCallback: Function,
  closeCallback: Function | undefined
) {
  const data = new InitData();
  const textInputController = data.getTextInputController();
  const screenShortController = data.getScreenShortController();
  const ScreenShortImageController = data.getScreenShortImageController();
  if (screenShortController == null || ScreenShortImageController == null)
    return;
  // 获取canvas容器
  const screenShortCanvas = screenShortController.getContext(
    "2d"
  ) as CanvasRenderingContext2D;
  // 工具栏尚未点击，当前属于首次点击，重新绘制一个无像素点的裁剪框
  if (!data.getToolClickStatus()) {
    // 获取裁剪框位置信息
    const cutBoxPosition = data.getCutOutBoxPosition();
    // 开始绘制无像素点裁剪框
    drawCutOutBox(
      cutBoxPosition.startX,
      cutBoxPosition.startY,
      cutBoxPosition.width,
      cutBoxPosition.height,
      screenShortCanvas,
      data.getBorderSize(),
      screenShortController as HTMLCanvasElement,
      ScreenShortImageController,
      false
    );
  }
  // 更新当前点击的工具栏条目
  data.setToolName(toolName);
  // 为当前点击项添加选中时的class名
  setSelectedClassName(mouseEvent, index, false);
  if (toolName != "text") {
    // 显示画笔选择工具栏
    data.setOptionStatus(true);
    // 设置画笔选择工具栏位置
    data.setOptionPosition(calculateOptionIcoPosition(index));
  } else {
    // 隐藏画笔工具栏
    data.setOptionStatus(false);
  }
  data.setRightPanel(true);
  if (toolName == "mosaicPen") {
    // 马赛克工具隐藏右侧颜色面板与角标
    data.setRightPanel(false);
    data.hiddenOptionIcoStatus();
  }
  // 清空文本输入区域的内容并隐藏文本输入框
  if (textInputController != null && data.getTextStatus()) {
    textInputController.innerHTML = "";
    data.setTextStatus(false);
  }
  // 初始化点击状态
  data.setDragging(false);
  data.setDraggingTrim(false);

  // 保存图片
  if (toolName == "save") {
    getCanvasImgData(true);
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
      completeCallback(base64);
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
