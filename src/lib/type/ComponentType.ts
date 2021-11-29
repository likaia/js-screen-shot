// 裁剪框节点事件定义
export type cutOutBoxBorder = {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number; // 样式
  option: number; // 操作
};

// 鼠标起始位置坐标
export type movePositionType = {
  moveStartX: number;
  moveStartY: number;
};

// 裁剪框位置参数
export type positionInfoType = {
  startX: number;
  startY: number;
  width: number;
  height: number;
};

// 裁剪框缩放时所返回的数据类型
export type zoomCutOutBoxReturnType = {
  tempStartX: number;
  tempStartY: number;
  tempWidth: number;
  tempHeight: number;
};

// 绘制裁剪框所返回的数据类型
export type drawCutOutBoxReturnType = {
  startX: number;
  startY: number;
  width: number;
  height: number;
};

// 截图工具栏图标数据类型
export type toolbarType = { id: number; title: string };

export type screenShotType = {
  enableWebRtc: boolean; // 是否启用webrtc，默认是启用状态
  level: number; // 截图容器层级
  canvasWidth: number; // 截图画布宽度
  canvasHeight: number; // 截图画布高度
  completeCallback: Function; // 工具栏截图确认回调
  closeCallback: Function; // 工具栏关闭回调
  triggerCallback: Function; // html2canvas截图响应回调
  cancelCallback: Function; // webrtc截图未授权回调
  position: { top?: number; left?: number }; // 截图容器位置
  clickCutFullScreen: boolean; // 单击截全屏启用状态, 默认值为false
};
