import { positionInfoType, textInfoType } from "@/lib/type/ComponentType";
import { takeOutHistory } from "@/lib/common-methods/TakeOutHistory";
import { getToolRelativePosition } from "@/lib/common-methods/GetToolRelativePosition";
import PlugInParameters from "@/lib/main-entrance/PlugInParameters";

// 裁剪框修剪状态
let draggingTrim = false;
// 裁剪框拖拽状态
let dragging = false;

// 截图工具栏点击状态
let toolClickStatus = false;
// 当前选择的颜色
let selectedColor = "#F53340";
// 当前点击的工具栏名称
let toolName = "";
//  当前选择的画笔大小
let penSize = 2;
// 马赛克工具的笔触大小
let mosaicPenSize = 10;
// 裁剪框顶点边框直径大小
const borderSize = 10;
// 撤销点击次数
let undoClickNum = 0;
// 画笔历史记录
let history: Array<Record<string, any>> = [];
// 文本输入工具栏点击状态
const textClickStatus = false;
// 工具栏超出截图容器状态
let toolPositionStatus = false;
// 裁剪框位置参数
let cutOutBoxPosition: positionInfoType = {
  startX: 0,
  startY: 0,
  width: 0,
  height: 0
};

// 获取截图容器dom
let screenShotController: HTMLCanvasElement | null = null;
// 获取截图工具栏容器dom
let toolController: HTMLDivElement | null = null;
let cutBoxSizeContainer: HTMLDivElement | null = null;
// 获取文本输入区域dom
let textInputController: HTMLDivElement | null = null;
// 截图工具栏画笔选择dom
let optionIcoController: HTMLDivElement | null = null;
let optionController: HTMLDivElement | null = null;
let colorSelectController: HTMLElement | null = null;
let rightPanel: HTMLElement | null = null;
let colorSelectPanel: HTMLElement | null = null;
let undoController: HTMLElement | null = null;
// 屏幕截图容器
let screenShotImageController: HTMLCanvasElement | null = null;
// 截图容器是否可滚动
let noScrollStatus = false;
// 数据初始化标识
let initStatus = false;
// 当前工具栏内选中的工具
let activeTool = "";
let textInfo: textInfoType;
// 是否需要还原页面的滚动条状态
let resetScrollbarState = false;
// 当前是否处于文本编辑状态
let textEditState = false;

export default class InitData {
  constructor() {
    // 标识为true时则初始化数据
    if (initStatus) {
      // 初始化完成设置其值为false
      initStatus = false;
      screenShotController = null;
      dragging = false;
      toolController = null;
      textInputController = null;
      optionController = null;
      optionIcoController = null;
      cutBoxSizeContainer = null;
      cutOutBoxPosition = {
        startX: 0,
        startY: 0,
        width: 0,
        height: 0
      };
      toolClickStatus = false;
      resetScrollbarState = false;
      textEditState = false;
      toolPositionStatus = false;
      selectedColor = "#F53340";
      toolName = "";
      penSize = 2;
      mosaicPenSize = 10;
      history = [];
      undoClickNum = 0;
      colorSelectController = null;
      rightPanel = null;
      colorSelectPanel = null;
      undoController = null;
    }
  }

  // 设置数据初始化标识
  public setInitStatus(status: boolean) {
    initStatus = status;
  }

  // 设置截图容器宽高
  public setScreenShotInfo(width: number, height: number) {
    this.getScreenShotContainer();
    if (screenShotController == null) return;
    // 增加截图锁屏
    if (noScrollStatus) {
      document.body.classList.add("__screenshot-lock-scroll");
    }
    screenShotController.width = width;
    screenShotController.height = height;
  }

  // 设置截图容器位置
  public setScreenShotPosition(left: number, top: number) {
    this.getScreenShotContainer();
    if (screenShotController == null) return;
    const { left: rLeft, top: rTop } = getToolRelativePosition(left, top);
    screenShotController.style.left = rLeft + "px";
    screenShotController.style.top = rTop + "px";
  }

  // 显示截图区域容器
  public showScreenShotPanel() {
    this.getScreenShotContainer();
    if (screenShotController == null) return;
    screenShotController.style.display = "block";
  }

  // 获取截图容器dom
  public getScreenShotContainer() {
    screenShotController = document.getElementById(
      "screenShotContainer"
    ) as HTMLCanvasElement | null;
    return screenShotController;
  }

  // 获取截图工具栏dom
  public getToolController() {
    toolController = document.getElementById(
      "toolPanel"
    ) as HTMLDivElement | null;
    return toolController;
  }

  // 获取裁剪框尺寸显示容器
  public getCutBoxSizeContainer() {
    cutBoxSizeContainer = document.getElementById(
      "cutBoxSizePanel"
    ) as HTMLDivElement | null;
    return cutBoxSizeContainer;
  }

  // 获取文本输入区域dom
  public getTextInputController() {
    textInputController = document.getElementById(
      "textInputPanel"
    ) as HTMLDivElement | null;
    return textInputController;
  }

  // 获取文本输入工具栏展示状态
  public getTextStatus() {
    return textClickStatus;
  }

  // 获取屏幕截图容器
  public getScreenShotImageController() {
    return screenShotImageController;
  }

  // 设置屏幕截图
  public setScreenShotImageController(imageController: HTMLCanvasElement) {
    screenShotImageController = imageController;
  }

  // 设置截图工具栏展示状态
  public setToolStatus(status: boolean) {
    toolController = this.getToolController() as HTMLDivElement;
    if (status) {
      toolController.style.display = "block";
      return;
    }
    toolController.style.display = "none";
  }

  // 设置裁剪框尺寸显示容器展示状态
  public setCutBoxSizeStatus(status: boolean) {
    if (cutBoxSizeContainer == null) return;
    if (status) {
      cutBoxSizeContainer.style.display = "flex";
      return;
    }
    cutBoxSizeContainer.style.display = "none";
  }

  // 设置裁剪框尺寸显示容器位置
  public setCutBoxSizePosition(x: number, y: number) {
    if (cutBoxSizeContainer == null) return;
    const { left, top } = getToolRelativePosition(x, y);
    cutBoxSizeContainer.style.left = left + "px";
    let sscTop = 0;
    if (screenShotController) {
      sscTop = parseInt(screenShotController.style.top);
    }
    cutBoxSizeContainer.style.top = top + sscTop + "px";
  }

  public setTextEditState(state: boolean) {
    textEditState = state;
  }
  public getTextEditState() {
    return textEditState;
  }

  // 设置裁剪框尺寸
  public setCutBoxSize(width: number, height: number) {
    if (cutBoxSizeContainer == null) return;
    const childrenPanel = cutBoxSizeContainer.childNodes;
    // p标签已存在直接更改文本值即可
    if (childrenPanel.length > 0) {
      (childrenPanel[0] as HTMLParagraphElement).innerText = `${width} * ${height}`;
      return;
    }
    // 不存在则渲染
    const textPanel = document.createElement("p");
    textPanel.innerText = `${width} * ${height}`;
    cutBoxSizeContainer.appendChild(textPanel);
  }

  // 设置文本输入工具栏展示状态
  public setTextStatus(status: boolean) {
    textInputController = this.getTextInputController();
    if (textInputController == null) return;
    if (status) {
      // 显示文本输入工具
      textInputController.style.display = "block";
      return;
    }
    textInputController.style.display = "none";
  }

  // 设置截图工具位置信息
  public setToolInfo(left: number, top: number) {
    toolController = document.getElementById("toolPanel") as HTMLDivElement;
    const { left: rLeft, top: rTop } = getToolRelativePosition(left, top);
    toolController.style.left = rLeft + "px";
    let sscTop = 0;
    if (screenShotController) {
      sscTop = parseInt(screenShotController.style.top);
    }
    toolController.style.top = rTop + sscTop + "px";
  }

  // 获取截图工具栏点击状态
  public getToolClickStatus() {
    return toolClickStatus;
  }

  // 设置截图工具栏点击状态
  public setToolClickStatus(status: boolean) {
    toolClickStatus = status;
  }

  public setResetScrollbarState(state: boolean) {
    resetScrollbarState = state;
  }
  public getResetScrollbarState() {
    return resetScrollbarState;
  }

  // 获取裁剪框位置信息
  public getCutOutBoxPosition() {
    return cutOutBoxPosition;
  }

  public getDragging() {
    return dragging;
  }
  public setDragging(status: boolean) {
    dragging = status;
  }

  public getDraggingTrim() {
    return draggingTrim;
  }

  public getToolPositionStatus() {
    return toolPositionStatus;
  }

  public setToolPositionStatus(status: boolean) {
    toolPositionStatus = status;
  }

  public setDraggingTrim(status: boolean) {
    draggingTrim = status;
  }

  // 设置裁剪框位置信息
  public setCutOutBoxPosition(
    mouseX: number,
    mouseY: number,
    width: number,
    height: number
  ) {
    cutOutBoxPosition.startX = mouseX;
    cutOutBoxPosition.startY = mouseY;
    cutOutBoxPosition.width = width;
    cutOutBoxPosition.height = height;
  }

  // 设置截图工具栏画笔选择工具展示状态
  public setOptionStatus(status: boolean) {
    // 获取截图工具栏与三角形角标容器
    optionIcoController = this.getOptionIcoController();
    optionController = this.getOptionController();
    if (optionIcoController == null || optionController == null) return;
    if (status) {
      optionIcoController.style.display = "block";
      optionController.style.display = "block";
      return;
    }
    optionIcoController.style.display = "none";
    optionController.style.display = "none";
  }

  // 隐藏画笔工具栏三角形角标
  public hiddenOptionIcoStatus() {
    optionIcoController = this.getOptionIcoController();
    if (optionIcoController == null) return;
    optionIcoController.style.display = "none";
  }

  // 获取截图工具栏画笔选择工具dom
  public getOptionIcoController() {
    optionIcoController = document.getElementById(
      "optionIcoController"
    ) as HTMLDivElement | null;
    return optionIcoController;
  }
  public getOptionController() {
    optionController = document.getElementById(
      "optionPanel"
    ) as HTMLDivElement | null;
    return optionController;
  }

  // 设置画笔选择工具栏位置
  public setOptionPosition(position: number) {
    // 获取截图工具栏与三角形角标容器
    optionIcoController = this.getOptionIcoController();
    optionController = this.getOptionController();
    if (optionIcoController == null || optionController == null) return;
    // 修改位置
    const toolPosition = this.getToolPosition();
    if (toolPosition == null) return;
    const icoLeft = toolPosition.left + position + "px";
    const icoTop = toolPosition.top + 44 + "px";
    const optionLeft = toolPosition.left + "px";
    const optionTop = toolPosition.top + 44 + 6 + "px";
    optionIcoController.style.left = icoLeft;
    optionIcoController.style.top = icoTop;
    optionController.style.left = optionLeft;
    optionController.style.top = optionTop;
  }

  // 获取工具栏位置
  public getToolPosition() {
    toolController = this.getToolController();
    if (toolController == null) return;
    return {
      left: toolController.offsetLeft,
      top: toolController.offsetTop
    };
  }

  // 获取/设置当前选择的颜色
  public getSelectedColor() {
    return selectedColor;
  }
  public setSelectedColor(color: string) {
    selectedColor = color;
    colorSelectPanel = this.getColorSelectPanel();
    if (colorSelectPanel == null) return;
    colorSelectPanel.style.backgroundColor = selectedColor;
  }

  public getColorSelectPanel() {
    colorSelectPanel = document.getElementById("colorSelectPanel");
    return colorSelectPanel;
  }

  // 获取/设置当前点击的工具栏条目名称
  public getToolName() {
    return toolName;
  }
  public setToolName(itemName: string) {
    toolName = itemName;
  }

  // 获取/设置当前画笔大小
  public getPenSize() {
    return penSize;
  }
  public setPenSize(size: number) {
    penSize = size;
  }

  public getMosaicPenSize() {
    return mosaicPenSize;
  }

  public setMosaicPenSize(size: number) {
    mosaicPenSize = size;
  }

  public getBorderSize() {
    return borderSize;
  }

  public getHistory() {
    return history;
  }

  public shiftHistory() {
    return history.shift();
  }

  public popHistory() {
    return history.pop();
  }

  public pushHistory(item: Record<string, any>) {
    history.push(item);
  }

  public getUndoClickNum() {
    return undoClickNum;
  }
  public setUndoClickNum(clickNumber: number) {
    undoClickNum = clickNumber;
  }

  public getColorPanel() {
    colorSelectController = document.getElementById("colorPanel");
    return colorSelectController;
  }
  public setColorPanelStatus(status: boolean) {
    colorSelectController = this.getColorPanel();
    if (colorSelectController == null) return;
    if (status) {
      colorSelectController.style.display = "flex";
      return;
    }
    colorSelectController.style.display = "none";
  }

  public getNoScrollStatus() {
    return noScrollStatus;
  }
  public setNoScrollStatus(status?: boolean) {
    if (status != null) {
      noScrollStatus = status;
    }
  }

  public setActiveToolName(toolName: string) {
    activeTool = toolName;
  }

  public getActiveToolName() {
    return activeTool;
  }

  public setTextInfo(info: textInfoType) {
    textInfo = info;
  }

  public getTextInfo() {
    return textInfo;
  }

  public getRightPanel() {
    rightPanel = document.getElementById("rightPanel");
    return rightPanel;
  }
  public setRightPanel(status: boolean) {
    rightPanel = this.getRightPanel();
    if (rightPanel == null) return;
    if (status) {
      rightPanel.style.display = "flex";
      return;
    }
    rightPanel.style.display = "none";
  }

  public setUndoStatus(status: boolean) {
    undoController = this.getUndoController();
    if (undoController == null) return;
    if (status) {
      // 启用撤销按钮
      undoController.classList.add("undo");
      undoController.classList.remove("undo-disabled");
      undoController.addEventListener("click", this.cancelEvent);
      return;
    }
    // 禁用撤销按钮
    undoController.classList.add("undo-disabled");
    undoController.classList.remove("undo");
    undoController.removeEventListener("click", this.cancelEvent);
  }

  public cancelEvent() {
    takeOutHistory();
  }

  public getUndoController() {
    undoController = document.getElementById("undoPanel");
    return undoController;
  }

  // 销毁截图容器
  public destroyDOM() {
    if (
      screenShotController == null ||
      toolController == null ||
      optionIcoController == null ||
      optionController == null ||
      textInputController == null ||
      cutBoxSizeContainer == null
    )
      return;
    const plugInParameters = new PlugInParameters();
    // 销毁dom
    if (noScrollStatus) {
      document.body.classList.remove("__screenshot-lock-scroll");
    }
    document.body.removeChild(screenShotController);
    document.body.removeChild(toolController);
    document.body.removeChild(optionIcoController);
    document.body.removeChild(optionController);
    document.body.removeChild(textInputController);
    document.body.removeChild(cutBoxSizeContainer);
    if (document.body.classList.contains("no-cursor")) {
      document.body.classList.remove("no-cursor");
    }
    if (resetScrollbarState) {
      // 还原滚动条状态
      document.documentElement.classList.remove("hidden-screen-shot-scroll");
      document.body.classList.remove("hidden-screen-shot-scroll");
    }
    // 重置插件全局参数状态
    plugInParameters.setInitStatus(true);
  }
}
