import { cutOutBoxBorder, positionInfoType } from "@/lib/type/ComponentType";

/**
 * 保存边框节点的相关信息
 * @param borderSize 边框节点直径大小
 * @param positionInfo 裁剪框位置信息
 * @private
 */
export function saveBorderArrInfo(
  borderSize: number,
  positionInfo: positionInfoType
) {
  // 获取裁剪框位置信息
  const { startX, startY, width, height } = positionInfo;
  const halfBorderSize = borderSize / 2;
  const borderArr: Array<cutOutBoxBorder> = [];
  // 移动, n北s南e东w西
  borderArr[0] = {
    x: startX + halfBorderSize,
    y: startY + halfBorderSize,
    width: width - borderSize,
    height: height - borderSize,
    index: 1,
    option: 1
  };
  // n
  borderArr[1] = {
    x: startX + halfBorderSize,
    y: startY,
    width: width - borderSize,
    height: halfBorderSize,
    index: 2,
    option: 2
  };
  borderArr[2] = {
    x: startX - halfBorderSize + width / 2,
    y: startY - halfBorderSize,
    width: borderSize,
    height: halfBorderSize,
    index: 2,
    option: 2
  };
  // s
  borderArr[3] = {
    x: startX + halfBorderSize,
    y: startY - halfBorderSize + height,
    width: width - borderSize,
    height: halfBorderSize,
    index: 2,
    option: 3
  };
  borderArr[4] = {
    x: startX - halfBorderSize + width / 2,
    y: startY + height,
    width: borderSize,
    height: halfBorderSize,
    index: 2,
    option: 3
  };
  // w
  borderArr[5] = {
    x: startX,
    y: startY + halfBorderSize,
    width: halfBorderSize,
    height: height - borderSize,
    index: 3,
    option: 4
  };
  borderArr[6] = {
    x: startX - halfBorderSize,
    y: startY - halfBorderSize + height / 2,
    width: halfBorderSize,
    height: borderSize,
    index: 3,
    option: 4
  };
  // e
  borderArr[7] = {
    x: startX - halfBorderSize + width,
    y: startY + halfBorderSize,
    width: halfBorderSize,
    height: height - borderSize,
    index: 3,
    option: 5
  };
  borderArr[8] = {
    x: startX + width,
    y: startY - halfBorderSize + height / 2,
    width: halfBorderSize,
    height: borderSize,
    index: 3,
    option: 5
  };
  // nw
  borderArr[9] = {
    x: startX - halfBorderSize,
    y: startY - halfBorderSize,
    width: borderSize,
    height: borderSize,
    index: 4,
    option: 6
  };
  // se
  borderArr[10] = {
    x: startX - halfBorderSize + width,
    y: startY - halfBorderSize + height,
    width: borderSize,
    height: borderSize,
    index: 4,
    option: 7
  };
  // ne
  borderArr[11] = {
    x: startX - halfBorderSize + width,
    y: startY - halfBorderSize,
    width: borderSize,
    height: borderSize,
    index: 5,
    option: 8
  };
  // sw
  borderArr[12] = {
    x: startX - halfBorderSize,
    y: startY - halfBorderSize + height,
    width: borderSize,
    height: borderSize,
    index: 5,
    option: 9
  };
  return borderArr;
}
