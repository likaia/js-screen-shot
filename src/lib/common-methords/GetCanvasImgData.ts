import { saveCanvasToImage } from "@/lib/common-methords/SaveCanvasToImage";
import { saveCanvasToBase64 } from "@/lib/common-methords/SaveCanvasToBase64";
import InitData from "@/lib/main-entrance/InitData";

/**
 * 将指定区域的canvas转为图片
 */
export function getCanvasImgData(isSave: boolean) {
  const data = new InitData();
  const screenShortCanvas = data.getScreenShortController()?.getContext("2d");
  // 获取裁剪区域位置信息
  const { startX, startY, width, height } = data.getCutOutBoxPosition();
  let base64 = "";
  // 保存图片,需要减去八个点的大小
  if (screenShortCanvas) {
    if (isSave) {
      // 将canvas转为图片
      if (width > 0 && height > 0) {
        // 考虑左上往右下拉区域的情况
        saveCanvasToImage(
          screenShortCanvas,
          startX + data.getBorderSize() / 2,
          startY + data.getBorderSize() / 2,
          width - data.getBorderSize(),
          height - data.getBorderSize()
        );
      } else if (width < 0 && height < 0) {
        // 考虑右下往左上拉区域的情况
        saveCanvasToImage(
          screenShortCanvas,
          startX + width + data.getBorderSize() / 2,
          startY + height + data.getBorderSize() / 2,
          Math.abs(width) - data.getBorderSize(),
          Math.abs(height) - data.getBorderSize()
        );
      } else if (width > 0 && height < 0) {
        // 考虑左下往右上拉区域的情况
        saveCanvasToImage(
          screenShortCanvas,
          startX + data.getBorderSize() / 2,
          startY + height + data.getBorderSize() / 2,
          width - data.getBorderSize(),
          Math.abs(height) - data.getBorderSize()
        );
      } else if (width < 0 && height > 0) {
        // 考虑右上往左下拉区域的情况
        saveCanvasToImage(
          screenShortCanvas,
          startX + width + data.getBorderSize() / 2,
          startY + data.getBorderSize() / 2,
          Math.abs(width) - data.getBorderSize(),
          height - data.getBorderSize()
        );
      }
    } else {
      // 将canvas转为base64
      if (width > 0 && height > 0) {
        // 考虑左上往右下拉区域的情况
        base64 = saveCanvasToBase64(
          screenShortCanvas,
          startX + data.getBorderSize() / 2,
          startY + data.getBorderSize() / 2,
          width - data.getBorderSize(),
          height - data.getBorderSize()
        );
      } else if (width < 0 && height < 0) {
        // 考虑右下往左上拉区域的情况
        base64 = saveCanvasToBase64(
          screenShortCanvas,
          startX + width + data.getBorderSize() / 2,
          startY + height + data.getBorderSize() / 2,
          Math.abs(width) - data.getBorderSize(),
          Math.abs(height) - data.getBorderSize()
        );
      } else if (width > 0 && height < 0) {
        // 考虑左下往右上拉区域的情况
        base64 = saveCanvasToBase64(
          screenShortCanvas,
          startX + data.getBorderSize() / 2,
          startY + height + data.getBorderSize() / 2,
          width - data.getBorderSize(),
          Math.abs(height) - data.getBorderSize()
        );
      } else if (width < 0 && height > 0) {
        // 考虑右上往左下拉区域的情况
        base64 = saveCanvasToBase64(
          screenShortCanvas,
          startX + width + data.getBorderSize() / 2,
          startY + data.getBorderSize() / 2,
          Math.abs(width) - data.getBorderSize(),
          height - data.getBorderSize()
        );
      }
    }
  }
  // 销毁组件
  return base64;
}
