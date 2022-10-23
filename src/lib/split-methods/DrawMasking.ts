import PlugInParameters from "@/lib/main-entrance/PlugInParameters";

/**
 * 绘制蒙层
 * @param context 需要进行绘制canvas
 * @param imgData 屏幕截图canvas容器
 */
export function drawMasking(
  context: CanvasRenderingContext2D,
  imgData?: HTMLCanvasElement
) {
  const data = new PlugInParameters();
  const plugInParameters = new PlugInParameters();
  const canvasSize = plugInParameters.getCanvasSize();
  const maxWidth = Math.max(
    window.innerWidth || 0,
    Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
    Math.max(document.body.offsetWidth, document.documentElement.offsetWidth),
    Math.max(document.body.clientWidth, document.documentElement.clientWidth)
  );
  const maxHeight = Math.max(
    window.innerHeight || 0,
    Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
    Math.max(document.body.offsetHeight, document.documentElement.offsetHeight),
    Math.max(document.body.clientHeight, document.documentElement.clientHeight)
  );
  // 清除画布
  context.clearRect(0, 0, maxWidth, maxHeight);
  // 屏幕截图存在且展示截图数据的状态为true则进行绘制
  if (imgData != null && plugInParameters.getShowScreenDataStatus()) {
    // 调用者传了画布尺寸则使用，否则使用窗口宽高
    if (canvasSize.canvasWidth !== 0 && canvasSize.canvasHeight !== 0) {
      context.drawImage(
        imgData,
        0,
        0,
        canvasSize.canvasWidth,
        canvasSize.canvasHeight
      );
    } else {
      context.drawImage(imgData, 0, 0, maxWidth, maxHeight);
    }
  }
  // 绘制蒙层
  context.save();
  const maskColor = data.getMaskColor();
  context.fillStyle = "rgba(0, 0, 0, .6)";
  if (maskColor) {
    context.fillStyle = `rgba(${maskColor.r}, ${maskColor.g}, ${maskColor.b}, ${maskColor.a})`;
  }
  if (canvasSize.canvasWidth !== 0 && canvasSize.canvasHeight !== 0) {
    context.fillRect(0, 0, canvasSize.canvasWidth, canvasSize.canvasHeight);
  } else {
    context.fillRect(0, 0, maxWidth, maxHeight);
  }
  // 绘制结束
  context.restore();
}
