/**
 * 计算传进来的数据，不让其移出可视区域
 * @param data 需要计算的数据
 * @param trimDistance 裁剪框宽度
 * @param canvasDistance 画布宽度
 */
export function fixedData(
  data: number,
  trimDistance: number,
  canvasDistance: number
) {
  const nonNegativeData = function(data: number) {
    return data > 0 ? data : 0;
  };

  if (nonNegativeData(data) + trimDistance > canvasDistance) {
    return nonNegativeData(canvasDistance - trimDistance);
  } else {
    return nonNegativeData(data);
  }
}

/**
 * 对参数进行处理，小于0则返回0
 */
export function nonNegativeData(data: number) {
  return data > 0 ? data : 0;
}
