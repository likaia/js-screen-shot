export function getSelectedClassName(index: number) {
  let className = "";
  switch (index) {
    case 1:
      className = "square-active";
      break;
    case 2:
      className = "round-active";
      break;
    case 3:
      className = "right-top-active";
      break;
    case 4:
      className = "brush-active";
      break;
    case 5:
      className = "mosaicPen-active";
      break;
    case 6:
      className = "text-active";
  }
  return className;
}
