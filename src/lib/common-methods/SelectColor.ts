import InitData from "@/lib/main-entrance/InitData";

export function selectColor() {
  const data = new InitData();
  // 显示颜色选择面板
  data.setColorPanelStatus(true);
}
