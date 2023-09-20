import InitData from "@/lib/main-entrance/InitData";
import { setSelectedClassName } from "@/lib/common-methods/SetSelectedClassName";

/**
 * 设置画笔大小
 * @param size
 * @param index
 * @param mouseEvent
 */
export function setBrushSize(
  size: string,
  index: number,
  mouseEvent: MouseEvent
) {
  const data = new InitData();
  // 为当前点击项添加选中时的class名
  setSelectedClassName(mouseEvent, index, true);
  let sizeNum = 10;
  switch (size) {
    case "small":
      sizeNum = 10;
      break;
    case "medium":
      sizeNum = 20;
      break;
    case "big":
      sizeNum = 40;
      break;
  }
  data.setPenSize(sizeNum);
  return sizeNum;
}
