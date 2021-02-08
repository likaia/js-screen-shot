import CreateDom from "@/lib/main-entrance/CreateDom";
// 导入截图所需样式
import "@/assets/scss/screen-short.scss";

export default class ScreenShort {
  constructor() {
    console.log("组件挂载成功");
  }

  // 加载组件
  public load() {
    const createDom = new CreateDom();
    console.log("组件创建成功", createDom);
  }

  // 销毁组件
  public destroy() {
    console.log("组件销毁成功");
  }
}
