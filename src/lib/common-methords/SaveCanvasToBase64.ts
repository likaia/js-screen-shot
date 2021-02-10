/**
 * 将指定区域的canvas转换为base64格式的图片
 */
export function saveCanvasToBase64(
  context: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  width: number,
  height: number
) {
  // 获取裁剪框区域图片信息
  const img = context.getImageData(startX, startY, width, height);
  // 创建canvas标签，用于存放裁剪区域的图片
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  // 获取裁剪框区域画布
  const imgContext = canvas.getContext("2d");
  if (imgContext) {
    // 将图片放进canvas中
    imgContext.putImageData(img, 0, 0);
    return canvas.toDataURL("png");
  }
  return "";
}
