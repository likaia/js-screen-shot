import toolbar from "@/lib/config/Toolbar";
import { toolbarType } from "@/lib/type/ComponentType";

export default class CreateDom {
  // 截图区域canvas容器
  private screenShortController: HTMLCanvasElement;
  // 截图工具栏容器
  private toolController: HTMLDivElement;
  // 绘制选项顶部ico容器
  private readonly optionIcoController: HTMLDivElement;
  // 画笔绘制选项容器
  private readonly optionController: HTMLDivElement;
  // 文字工具输入容器
  private readonly textInputController: HTMLDivElement;

  // 截图工具栏图标
  private readonly toolbar: Array<toolbarType>;

  constructor() {
    this.screenShortController = document.createElement("canvas");
    this.toolController = document.createElement("div");
    this.optionIcoController = document.createElement("div");
    this.optionController = document.createElement("div");
    this.textInputController = document.createElement("div");
    // 为所有dom设置id
    this.setAllControllerId();
    // 为画笔绘制选项角标设置class
    this.setOptionIcoClassName();
    this.toolbar = toolbar;
    // 渲染工具栏
    this.setToolBarIco();
    // 渲染画笔相关选项
    this.setBrushSelectPanel();
    // 渲染文本输入
    this.setTextInputPanel();
    // 渲染页面
    this.setDomToBody();
  }

  // 渲染截图工具栏图标
  private setToolBarIco() {
    for (let i = 0; i < this.toolbar.length; i++) {
      const item = this.toolbar[i];
      const itemPanel = document.createElement("div");
      // 撤销按钮单独处理
      if (item.title == "undo") {
        itemPanel.className = `item-panel undo-disabled`;
      } else {
        itemPanel.className = `item-panel ${item.title}`;
      }
      itemPanel.setAttribute("data-title", item.title);
      itemPanel.setAttribute("data-id", item.id + "");
      this.toolController.appendChild(itemPanel);
    }
  }

  // 渲染画笔大小选择图标与颜色选择容器
  private setBrushSelectPanel() {
    // 创建画笔选择容器
    const brushSelectPanel = document.createElement("div");
    brushSelectPanel.className = "brush-select-panel";
    for (let i = 0; i < 3; i++) {
      // 创建画笔图标容器
      const itemPanel = document.createElement("div");
      itemPanel.className = "item-panel";
      switch (i) {
        case 0:
          itemPanel.classList.add("brush-small");
          itemPanel.classList.add("brush-small-active");
          break;
        case 1:
          itemPanel.classList.add("brush-medium");
          break;
        case 2:
          itemPanel.classList.add("brush-big");
          break;
      }
      brushSelectPanel.appendChild(itemPanel);
    }
    // 右侧颜色选择容器
    const rightPanel = document.createElement("div");
    rightPanel.className = "right-panel";
    // 创建颜色选择容器
    const colorSelectPanel = document.createElement("div");
    colorSelectPanel.className = "color-select-panel";
    // 创建颜色显示容器
    const colorPanel = document.createElement("div");
    colorPanel.className = "color-panel";
    for (let i = 0; i < 10; i++) {
      const colorItem = document.createElement("div");
      colorItem.className = "color-item";
      colorItem.setAttribute("data-index", i + "");
      colorPanel.appendChild(colorItem);
    }
    colorSelectPanel.appendChild(colorPanel);
    rightPanel.appendChild(colorSelectPanel);
    // 创建颜色下拉箭头选择容器
    const pullDownArrow = document.createElement("div");
    pullDownArrow.className = "pull-down-arrow";
    rightPanel.appendChild(pullDownArrow);
    // 向画笔绘制选项容器追加画笔选择和颜色显示容器
    this.optionController.appendChild(brushSelectPanel);
    this.optionController.appendChild(rightPanel);
  }

  // 渲染文本输入区域容器
  private setTextInputPanel() {
    // 让div可编辑
    this.textInputController.contentEditable = "true";
    // 关闭拼写检查
    this.textInputController.spellcheck = false;
  }

  // 为所有Dom设置id
  private setAllControllerId() {
    this.screenShortController.id = "screenShotContainer";
    this.toolController.id = "toolPanel";
    this.optionIcoController.id = "optionIcoController";
    this.optionController.id = "optionPanel";
    this.textInputController.id = "textInputPanel";
  }

  // 将截图相关dom渲染至body
  private setDomToBody() {
    document.body.appendChild(this.screenShortController);
    document.body.appendChild(this.toolController);
    document.body.appendChild(this.optionIcoController);
    document.body.appendChild(this.optionController);
    document.body.appendChild(this.textInputController);
  }

  // 设置画笔绘制选项顶部ico样式
  private setOptionIcoClassName() {
    this.optionIcoController.className = "ico-panel";
  }

  /**
   * 设置截图区域容器大小
   * @param width
   * @param height
   * @private
   */
  private setScreenShortControllerSize(width: number, height: number) {
    this.screenShortController = document.getElementById(
      "screenShortController"
    ) as HTMLCanvasElement;
    // 设置宽高
    this.screenShortController.width = width;
    this.screenShortController.height = height;
  }

  /**
   * 设置截图工具栏位置
   * @param top
   * @param left
   * @private
   */
  private setToolControllerPosition(top: number, left: number) {
    this.toolController = document.getElementById(
      "toolController"
    ) as HTMLDivElement;
    // 设置宽高
    this.toolController.style.top = top + "px";
    this.toolController.style.left = left + "px";
  }

  /**
   * 设置画笔绘制选项顶部ico位置
   * @param left
   * @param top
   * @private
   */
  private setOptionIcoPosition(left: number, top: number) {
    this.optionIcoController.style.left = left + "px";
    this.optionIcoController.style.top = top + "px";
  }

  /**
   * 设置画笔绘制选项位置
   * @param left
   * @param top
   * @private
   */
  private setOptionControllerPosition(left: number, top: number) {
    this.optionController.style.left = left + "px";
    this.optionController.style.top = top + "px";
  }

  /**
   * 设置文字输入工具位置
   * @param left
   * @param top
   * @private
   */
  private setTextInputControllerPosition(left: number, top: number) {
    this.textInputController.style.left = left + "px";
    this.textInputController.style.top = top + "px";
  }
}
