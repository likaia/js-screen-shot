/**
 * 绘制箭头
 * @param context 需要进行绘制的画布
 * @param mouseStartX 鼠标按下时的x轴坐标 P1
 * @param mouseStartY 鼠标按下式的y轴坐标 P1
 * @param mouseX 当前鼠标x轴坐标 P2
 * @param mouseY 当前鼠标y轴坐标 P2
 * @param theta 箭头斜线与直线的夹角角度 (θ) P3 ---> (P1、P2) || P4 ---> P1(P1、P2)
 * @param slashLength 箭头斜线的长度 P3 ---> P2 || P4 ---> P2
 * @param borderWidth 边框宽度
 * @param color 边框颜色
 */
export function drawLineArrow(
  context: CanvasRenderingContext2D,
  mouseStartX: number,
  mouseStartY: number,
  mouseX: number,
  mouseY: number,
  theta: number,
  slashLength: number,
  borderWidth: number,
  color: string
) {
  /**
   * 已知:
   *    1. P1、P2的坐标
   *    2. 箭头斜线(P3 || P4) ---> P2直线的长度
   *    3. 箭头斜线(P3 || P4) ---> (P1、P2)直线的夹角角度(θ)
   * 求:
   *    P3、P4的坐标
   */
  const angle =
      (Math.atan2(mouseStartY - mouseY, mouseStartX - mouseX) * 180) / Math.PI, // 通过atan2来获取箭头的角度
    angle1 = ((angle + theta) * Math.PI) / 180, // P3点的角度
    angle2 = ((angle - theta) * Math.PI) / 180, // P4点的角度
    topX = slashLength * Math.cos(angle1), // P3点的x轴坐标
    topY = slashLength * Math.sin(angle1), // P3点的y轴坐标
    botX = slashLength * Math.cos(angle2), // P4点的X轴坐标
    botY = slashLength * Math.sin(angle2); // P4点的Y轴坐标

  // 开始绘制
  context.save();
  context.beginPath();

  // P3的坐标位置
  let arrowX = mouseStartX - topX,
    arrowY = mouseStartY - topY;

  // 移动笔触到P3坐标
  context.moveTo(arrowX, arrowY);
  // 移动笔触到P1
  context.moveTo(mouseStartX, mouseStartY);
  // 绘制P1到P2的直线
  context.lineTo(mouseX, mouseY);
  // 计算P3的位置
  arrowX = mouseX + topX;
  arrowY = mouseY + topY;
  // 移动笔触到P3坐标
  context.moveTo(arrowX, arrowY);
  // 绘制P2到P3的斜线
  context.lineTo(mouseX, mouseY);
  // 计算P4的位置
  arrowX = mouseX + botX;
  arrowY = mouseY + botY;
  // 绘制P2到P4的斜线
  context.lineTo(arrowX, arrowY);
  // 上色
  context.strokeStyle = color;
  context.lineWidth = borderWidth;
  // 填充
  context.stroke();
  // 结束绘制
  context.restore();
}
