/**
 * 绘制文本
 * @param text 需要进行绘制的文字
 * @param mouseX 绘制位置的X轴坐标
 * @param mouseY 绘制位置的Y轴坐标
 * @param color 字体颜色
 * @param fontSize 字体大小
 * @param context 需要你行绘制的画布
 */
export function drawText(
  text: string,
  mouseX: number,
  mouseY: number,
  color: string,
  fontSize: number,
  context: CanvasRenderingContext2D
) {
  context.save();
  context.lineWidth = 1;
  context.fillStyle = color;
  context.textBaseline = "middle";
  context.font = `bold ${fontSize}px none`;
  // 处理换行符并绘制多行文本
  const lines = text.split("\n"); // 根据换行符拆分文本为多行
  console.log(lines);
  const lineHeight = fontSize * 1.4; // 设定行高为字体大小的1.4倍
  lines.forEach((line, index) => {
    // 调整每行的垂直位置
    const lineY = mouseY + lineHeight * index;
    context.fillText(line, mouseX, lineY);
  });
  context.restore();
}
