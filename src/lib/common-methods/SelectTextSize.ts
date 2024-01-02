import InitData from "@/lib/main-entrance/InitData";

export function selectTextSize() {
  const data = new InitData();
  // 显示文字大小选择面板
  data.setTextSizeOptionStatus(true);
}

export function setTextSize(size: number) {
  const data = new InitData();
  // 设置字体大小
  data.setFontSize(size);
}

export function getTextSize() {
  const data = new InitData();
  // 获取字体大小
  return data.getFontSize();
}

export function hiddenTextSizeOptionStatus() {
  const data = new InitData();
  // 隐藏文字大小选择面板
  data.setTextSizeOptionStatus(false);
}

export function hiddenColorPanelStatus() {
  const data = new InitData();
  // 隐藏颜色选择面板
  data.setColorPanelStatus(false);
}
