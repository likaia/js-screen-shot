/**
 * 绘制矩形
 * @param mouseX
 * @param mouseY
 * @param width
 * @param height
 * @param color 边框颜色
 * @param borderWidth 边框大小
 * @param context 需要进行绘制的canvas画布
 * @param controller 需要进行操作的canvas容器
 * @param imageController 图片canvas容器
 */
export function drawRectangle(
  mouseX: number,
  mouseY: number,
  width: number,
  height: number,
  color: string,
  borderWidth: number,
  context: CanvasRenderingContext2D,
  controller: HTMLCanvasElement,
  imageController: HTMLCanvasElement
) {
  context.save();
  // 设置边框颜色
  context.strokeStyle = color;
  // 设置边框大小
  context.lineWidth = borderWidth;
  context.beginPath();
  // 绘制矩形
  context.rect(mouseX, mouseY, width, height);
  context.stroke();
  // 绘制结束
  context.restore();
  // 使用drawImage将图片绘制到蒙层下方
  context.save();
  context.globalCompositeOperation = "destination-over";
  context.drawImage(
    imageController,
    0,
    0,
    controller?.width,
    controller?.height
  );
  // 绘制结束
  context.restore();
}
