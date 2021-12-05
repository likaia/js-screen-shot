/**
 * 缩放裁剪框
 * @param currentX 当前鼠标X轴坐标
 * @param currentY 当前鼠标Y轴坐标
 * @param startX 裁剪框当前X轴坐标
 * @param startY 裁剪框当前Y轴坐标
 * @param width 裁剪框宽度
 * @param height 裁剪框高度
 * @param option 当前操作的节点
 * @private
 */
export declare function zoomCutOutBoxPosition(currentX: number, currentY: number, startX: number, startY: number, width: number, height: number, option: number): {
    tempStartX: number;
    tempStartY: number;
    tempWidth: number;
    tempHeight: number;
} | undefined;
