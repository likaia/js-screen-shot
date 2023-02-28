import InitData from "@/lib/main-entrance/InitData";

export function getColor(index: number) {
  const data = new InitData();
  let currentColor = "#F53440";
  switch (index) {
    case 1:
      currentColor = "#F53440";
      break;
    case 2:
      currentColor = "#F65E95";
      break;
    case 3:
      currentColor = "#D254CF";
      break;
    case 4:
      currentColor = "#12A9D7";
      break;
    case 5:
      currentColor = "#30A345";
      break;
    case 6:
      currentColor = "#FACF50";
      break;
    case 7:
      currentColor = "#F66632";
      break;
    case 8:
      currentColor = "#989998";
      break;
    case 9:
      currentColor = "#000000";
      break;
    case 10:
      currentColor = "#FEFFFF";
      break;
  }
  data.setSelectedColor(currentColor);
  // 隐藏颜色选择面板
  data.setColorPanelStatus(false);
  return currentColor;
}
