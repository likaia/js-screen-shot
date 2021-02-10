/**
 * 计算截图工具栏画笔选项三角形角标位置
 * @param index
 */
export function calculateOptionIcoPosition(index: number) {
  switch (index) {
    case 1:
      return 24 - 8;
    case 2:
      return 24 * 2 + 8;
    case 3:
      return 24 * 4 - 6;
    case 4:
      return 24 * 5 + 8;
    case 5:
      return 24 * 7 + 6;
    case 6:
      return 24 * 9 - 6;
    default:
      return 0;
  }
}
