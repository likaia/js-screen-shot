/* 获取文本内容的的换行部分*/
// const findBreakPoint = (
//   text: string,
//   width: number,
//   context: CanvasRenderingContext2D
// ) => {
//   let min = 0;
//   let max = text.length - 1;
//
//   while (min <= max) {
//     const middle = Math.floor((min + max) / 2);
//     const middleWidth = context.measureText(text.substr(0, middle)).width;
//     const oneCharWiderThanMiddleWidth = context.measureText(
//       text.substr(0, middle + 1)
//     ).width;
//     if (middleWidth <= width && oneCharWiderThanMiddleWidth > width) {
//       return middle;
//     }
//     if (middleWidth < width) {
//       min = middle + 1;
//     } else {
//       max = middle - 1;
//     }
//   }
//
//   return -1;
// };
//
// const breakLinesForCanvas = (
//   text: string,
//   width: number,
//   context: CanvasRenderingContext2D
// ) => {
//   const result = [];
//   let breakPoint = 0;
//
//   while ((breakPoint = findBreakPoint(text, width, context)) !== -1) {
//     result.push(text.substr(0, breakPoint));
//     text = text.substr(breakPoint);
//   }
//
//   if (text) {
//     result.push(text);
//   }
//
//   return result;
// };
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
  // 开始绘制
  context.save();
  context.lineWidth = 1;
  // 设置字体颜色
  context.fillStyle = color;
  context.textBaseline = "middle";
  context.font = `bold ${fontSize}px none`;
  context.fillText(text, mouseX, mouseY);
  // 结束绘制
  context.restore();
}
