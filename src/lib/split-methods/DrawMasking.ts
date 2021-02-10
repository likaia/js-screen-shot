/**
 * 绘制蒙层
 * @param context 需要进行绘制canvas
 */
export function drawMasking(context: CanvasRenderingContext2D) {
  // 清除画布
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  // 绘制蒙层
  context.save();
  context.fillStyle = "rgba(0, 0, 0, .6)";
  context.fillRect(0, 0, window.innerWidth, window.innerHeight);
  // 绘制结束
  context.restore();
}
