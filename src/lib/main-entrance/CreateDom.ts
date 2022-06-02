import toolbar from "@/lib/config/Toolbar";
import { screenShotType, toolbarType } from "@/lib/type/ComponentType";
import { toolClickEvent } from "@/lib/split-methods/ToolClickEvent";
import { setBrushSize } from "@/lib/common-methords/SetBrushSize";
import { selectColor } from "@/lib/common-methords/SelectColor";
import { getColor } from "@/lib/common-methords/GetColor";

export default class CreateDom {
  // 截图区域canvas容器
  private readonly screenShotController: HTMLCanvasElement;
  // 截图工具栏容器
  private readonly toolController: HTMLDivElement;
  // 绘制选项顶部ico容器
  private readonly optionIcoController: HTMLDivElement;
  // 画笔绘制选项容器
  private readonly optionController: HTMLDivElement;
  // 裁剪框大小显示容器
  private readonly cutBoxSizeContainer: HTMLDivElement;
  // 文字工具输入容器
  private readonly textInputController: HTMLDivElement;
  // 截图完成回调函数
  private readonly completeCallback: Function | undefined;
  // 截图关闭毁掉函数
  private readonly closeCallback: Function | undefined;
  // 需要隐藏的图标
  private readonly hiddenIcoArr: string[];

  // 截图工具栏图标
  private readonly toolbar: Array<toolbarType>;

  constructor(options: screenShotType) {
    this.screenShotController = document.createElement("canvas");
    this.toolController = document.createElement("div");
    this.optionIcoController = document.createElement("div");
    this.optionController = document.createElement("div");
    this.cutBoxSizeContainer = document.createElement("div");
    this.textInputController = document.createElement("div");
    this.completeCallback = options?.completeCallback;
    this.closeCallback = options?.closeCallback;
    this.hiddenIcoArr = [];
    // 成功回调函数不存在则设置一个默认的
    if (
      !options ||
      !Object.prototype.hasOwnProperty.call(options, "completeCallback")
    ) {
      this.completeCallback = (base64: string) => {
        sessionStorage.setItem("screenShotImg", base64);
      };
    }

    // 筛选需要隐藏的图标
    if (options?.hiddenToolIco) {
      if (options.hiddenToolIco?.save === true) {
        this.hiddenIcoArr.push("save");
      }
      if (options.hiddenToolIco?.undo === true) {
        this.hiddenIcoArr.push("undo");
      }
      if (options.hiddenToolIco?.confirm === true) {
        this.hiddenIcoArr.push("confirm");
      }
    }
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
    // 隐藏所有dom
    this.hiddenAllDom();
  }

  // 渲染截图工具栏图标
  private setToolBarIco() {
    for (let i = 0; i < this.toolbar.length; i++) {
      const item = this.toolbar[i];
      // 判断是否有需要隐藏的图标
      let icoHiddenStatus = false;
      for (let j = 0; j < this.hiddenIcoArr.length; j++) {
        if (this.hiddenIcoArr[j] === item.title) {
          icoHiddenStatus = true;
          break;
        }
      }
      // 图标隐藏状态为true则直接跳过本次循环
      if (icoHiddenStatus) continue;
      const itemPanel = document.createElement("div");
      // 撤销按钮单独处理
      if (item.title == "undo") {
        itemPanel.className = `item-panel undo-disabled`;
        itemPanel.id = "undoPanel";
      } else {
        itemPanel.className = `item-panel ${item.title}`;
        itemPanel.addEventListener("click", e => {
          toolClickEvent(
            item.title,
            item.id,
            e,
            this.completeCallback,
            this.closeCallback
          );
        });
      }
      itemPanel.setAttribute("data-title", item.title);
      itemPanel.setAttribute("data-id", item.id + "");
      this.toolController.appendChild(itemPanel);
    }
    // 有需要隐藏的截图工具栏时，则修改其最小宽度
    if (this.hiddenIcoArr.length > 0) {
      this.toolController.style.minWidth = "275px";
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
          itemPanel.addEventListener("click", e => {
            setBrushSize("small", 1, e);
          });
          break;
        case 1:
          itemPanel.classList.add("brush-medium");
          itemPanel.addEventListener("click", e => {
            setBrushSize("medium", 2, e);
          });
          break;
        case 2:
          itemPanel.classList.add("brush-big");
          itemPanel.addEventListener("click", e => {
            setBrushSize("big", 3, e);
          });
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
    colorSelectPanel.id = "colorSelectPanel";
    colorSelectPanel.addEventListener("click", () => {
      selectColor();
    });
    // 创建颜色显示容器
    const colorPanel = document.createElement("div");
    colorPanel.id = "colorPanel";
    colorPanel.className = "color-panel";
    colorPanel.style.display = "none";
    for (let i = 0; i < 10; i++) {
      const colorItem = document.createElement("div");
      colorItem.className = "color-item";
      colorItem.addEventListener("click", () => {
        getColor(i + 1);
      });
      colorItem.setAttribute("data-index", i + "");
      colorPanel.appendChild(colorItem);
    }
    rightPanel.appendChild(colorPanel);
    rightPanel.appendChild(colorSelectPanel);
    rightPanel.id = "rightPanel";
    // 创建颜色下拉箭头选择容器
    const pullDownArrow = document.createElement("div");
    pullDownArrow.className = "pull-down-arrow";
    pullDownArrow.addEventListener("click", () => {
      selectColor();
    });
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
    this.screenShotController.id = "screenShotContainer";
    this.toolController.id = "toolPanel";
    this.optionIcoController.id = "optionIcoController";
    this.optionController.id = "optionPanel";
    this.cutBoxSizeContainer.id = "cutBoxSizePanel";
    this.textInputController.id = "textInputPanel";
  }

  // 隐藏所有dom
  private hiddenAllDom() {
    this.screenShotController.style.display = "none";
    this.toolController.style.display = "none";
    this.optionIcoController.style.display = "none";
    this.optionController.style.display = "none";
    this.cutBoxSizeContainer.style.display = "none";
    this.textInputController.style.display = "none";
  }

  // 将截图相关dom渲染至body
  private setDomToBody() {
    document.body.appendChild(this.screenShotController);
    document.body.appendChild(this.toolController);
    document.body.appendChild(this.optionIcoController);
    document.body.appendChild(this.optionController);
    document.body.appendChild(this.cutBoxSizeContainer);
    document.body.appendChild(this.textInputController);
  }

  // 设置画笔绘制选项顶部ico样式
  private setOptionIcoClassName() {
    this.optionIcoController.className = "ico-panel";
  }
}
