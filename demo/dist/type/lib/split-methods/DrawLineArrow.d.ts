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
export declare function drawLineArrow(context: CanvasRenderingContext2D, mouseStartX: number, mouseStartY: number, mouseX: number, mouseY: number, theta: number, slashLength: number, borderWidth: number, color: string): void;
