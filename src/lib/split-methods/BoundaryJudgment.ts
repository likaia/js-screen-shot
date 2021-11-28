import { positionInfoType } from "@/lib/type/ComponentType";

/**
 * 获取工具栏工具边界绘制状态
 * @param startX x轴绘制起点
 * @param startY y轴绘制起点
 * @param cutBoxPosition 裁剪框位置信息
 */
export function getDrawBoundaryStatus(
  startX: number,
  startY: number,
  cutBoxPosition: positionInfoType
): boolean {
  if (
    startX < cutBoxPosition.startX ||
    startY < cutBoxPosition.startY ||
    startX > cutBoxPosition.startX + cutBoxPosition.width ||
    startY > cutBoxPosition.startY + cutBoxPosition.height
  ) {
    // 无法绘制
    return false;
  }
  // 可以绘制
  return true;
}
