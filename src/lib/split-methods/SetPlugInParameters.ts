import { screenShotType } from "@/lib/type/ComponentType";
import PlugInParameters from "@/lib/main-entrance/PlugInParameters";

// 为插件的全局参数设置数据
export function setPlugInParameters(options: screenShotType) {
  const plugInParameters = new PlugInParameters();
  // webrtc启用状态, 默认为true，如果设置了false则修改默认值
  if (options?.enableWebRtc === false) {
    plugInParameters.setWebRtcStatus(false);
    plugInParameters.setInitStatus(false);
  }

  // 读取并设置参数中的视频流数据
  if (options?.screenFlow instanceof MediaStream) {
    plugInParameters.setScreenFlow(options.screenFlow);
  }

  // 读取参数中的画布宽高, 两者都存在时才设置
  if (options?.canvasWidth && options?.canvasHeight) {
    plugInParameters.setCanvasSize(options.canvasWidth, options.canvasHeight);
  }

  // 读取参数设置默认展示截屏数据的状态，默认为false，如果设置了true才修改
  if (options?.showScreenData === true) {
    plugInParameters.setShowScreenDataStatus(true);
  }
  if (options?.maskColor && typeof options.maskColor === "object") {
    plugInParameters.setMaskColor(options.maskColor);
  }
}
