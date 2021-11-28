import { positionInfoType } from "@/lib/type/ComponentType";
import { takeOutHistory } from "@/lib/common-methords/TakeOutHistory";

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
// 裁剪框顶点边框直径大小
const borderSize = 10;
// 撤销点击次数
let undoClickNum = 0;
// 画笔历史记录
let history: Array<Record<string, any>> = [];
// 文本输入工具栏点击状态
const textClickStatus = false;
// 裁剪框位置参数
let cutOutBoxPosition: positionInfoType = {
  startX: 0,
  startY: 0,
  width: 0,
  height: 0
};

// 获取截图容器dom
let screenShortController: HTMLCanvasElement | null = null;
// 获取截图工具栏容器dom
let toolController: HTMLDivElement | null = null;
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
let screenShortImageController: HTMLCanvasElement | null = null;

// 数据初始化标识
let initStatus = false;

export default class InitData {
  constructor() {
    // 标识为true时则初始化数据
    if (initStatus) {
      // 初始化完成设置其值为false
      initStatus = false;
      screenShortController = null;
      toolController = null;
      textInputController = null;
      optionController = null;
      optionIcoController = null;
      cutOutBoxPosition = {
        startX: 0,
        startY: 0,
        width: 0,
        height: 0
      };
      toolClickStatus = false;
      selectedColor = "#F53340";
      toolName = "";
      penSize = 2;
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
  public setScreenShortInfo(width: number, height: number) {
    this.getScreenShortController();
    if (screenShortController == null) return;
    screenShortController.width = width;
    screenShortController.height = height;
  }

  // 设置截图容器位置
  public setScreenShotPosition(left: number, top: number) {
    this.getScreenShortController();
    if (screenShortController == null) return;
    screenShortController.style.left = left + "px";
    screenShortController.style.top = top + "px";
  }

  // 显示截图区域容器
  public showScreenShortPanel() {
    this.getScreenShortController();
    if (screenShortController == null) return;
    screenShortController.style.display = "block";
  }

  // 获取截图容器dom
  public getScreenShortController() {
    screenShortController = document.getElementById(
      "screenShotContainer"
    ) as HTMLCanvasElement | null;
    return screenShortController;
  }

  // 获取截图工具栏dom
  public getToolController() {
    toolController = document.getElementById(
      "toolPanel"
    ) as HTMLDivElement | null;
    return toolController;
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
  public getScreenShortImageController() {
    return screenShortImageController;
  }

  // 设置屏幕截图
  public setScreenShortImageController(imageController: HTMLCanvasElement) {
    screenShortImageController = imageController;
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
    toolController.style.left = left + "px";
    toolController.style.top = top + "px";
  }

  // 获取截图工具栏点击状态
  public getToolClickStatus() {
    return toolClickStatus;
  }

  // 设置截图工具栏点击状态
  public setToolClickStatus(status: boolean) {
    toolClickStatus = status;
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
      screenShortController == null ||
      toolController == null ||
      optionIcoController == null ||
      optionController == null ||
      textInputController == null
    )
      return;
    // 销毁dom
    document.body.removeChild(screenShortController);
    document.body.removeChild(toolController);
    document.body.removeChild(optionIcoController);
    document.body.removeChild(optionController);
    document.body.removeChild(textInputController);
  }
}
