/**
 * 获取画笔选项对应的选中时的class名
 * @param itemName
 */
export function getBrushSelectedName(itemName: number) {
  let className = "";
  switch (itemName) {
    case 1:
      className = "brush-small-active";
      break;
    case 2:
      className = "brush-medium-active";
      break;
    case 3:
      className = "brush-big-active";
      break;
  }
  return className;
}
