/**
 * 获取截图工具栏相对于视口的位置
 */
export function getToolRelativePosition(
  left?: number,
  top?: number,
  dom: HTMLElement = document.body
) {
  const rect = dom.getBoundingClientRect();
  return { left: left || Math.abs(rect.left), top: top || Math.abs(rect.top) };
}
