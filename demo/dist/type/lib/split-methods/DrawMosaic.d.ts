/**
 * 绘制马赛克
 *    实现思路：
 *      1. 获取鼠标划过路径区域的图像信息
 *      2. 将区域内的像素点绘制成周围相近的颜色
 * @param mouseX 当前鼠标X轴坐标
 * @param mouseY 当前鼠标Y轴坐标
 * @param size 马赛克画笔大小
 * @param degreeOfBlur 马赛克模糊度
 * @param context 需要进行绘制的画布
 */
export declare function drawMosaic(mouseX: number, mouseY: number, size: number, degreeOfBlur: number, context: CanvasRenderingContext2D): void;
