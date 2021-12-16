let enableWebRtc = true;

// 数据初始化标识
let initStatus = false;

// 画布宽高
let canvasWidth = 0;
let canvasHeight = 0;

// 展示截屏图片至容器
let showScreenData = false;

export default class PlugInParameters {
  constructor() {
    // 标识为true时则初始化数据
    if (initStatus) {
      enableWebRtc = true;
      canvasWidth = 0;
      canvasHeight = 0;
      showScreenData = false;
      // 初始化完成设置其值为false
      initStatus = false;
    }
  }

  // 设置数据初始化标识
  public setInitStatus(status: boolean) {
    initStatus = status;
  }

  // 获取数据初始化标识
  public getInitStatus() {
    return initStatus;
  }

  // 获取webrtc启用状态
  public getWebRtcStatus() {
    return enableWebRtc;
  }

  // 设置webrtc启用状态
  public setWebRtcStatus(status: boolean) {
    enableWebRtc = status;
  }

  // 获取画布宽高
  public getCanvasSize() {
    return { canvasWidth: canvasWidth, canvasHeight: canvasHeight };
  }

  // 设置画布宽高
  public setCanvasSize(width: number, height: number) {
    canvasWidth = width;
    canvasHeight = height;
  }

  // 获取展示图片至容器的状态
  public getShowScreenDataStatus() {
    return showScreenData;
  }

  // 设置展示图片至容器的状态
  public setShowScreenDataStatus(status: boolean) {
    showScreenData = status;
  }
}
