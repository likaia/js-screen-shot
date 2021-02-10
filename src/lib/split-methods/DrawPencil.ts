/**
 * 画笔绘制
 * @param context
 * @param mouseX
 * @param mouseY
 * @param size
 * @param color
 */
export function drawPencil(
  context: CanvasRenderingContext2D,
  mouseX: number,
  mouseY: number,
  size: number,
  color: string
) {
  // 开始绘制
  context.save();
  // 设置边框大小
  context.lineWidth = size;
  // 设置边框颜色
  context.strokeStyle = color;
  context.lineTo(mouseX, mouseY);
  context.stroke();
  // 绘制结束
  context.restore();
}

/**
 * 画笔初始化
 */
export function initPencil(
  context: CanvasRenderingContext2D,
  mouseX: number,
  mouseY: number
) {
  // 开始||清空一条路径
  context.beginPath();
  // 移动画笔位置
  context.moveTo(mouseX, mouseY);
}
