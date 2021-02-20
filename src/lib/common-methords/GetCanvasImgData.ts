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
      saveCanvasToImage(
        screenShortCanvas,
        startX + data.getBorderSize() / 2.4,
        startY + data.getBorderSize() / 2.4,
        width - data.getBorderSize() * 2.4,
        height - data.getBorderSize() * 2.4
      );
    } else {
      // 将canvas转为base64
      base64 = saveCanvasToBase64(
        screenShortCanvas,
        startX + data.getBorderSize() / 2.4,
        startY + data.getBorderSize() / 2.4,
        width - data.getBorderSize() * 2.4,
        height - data.getBorderSize() * 2.4
      );
    }
  }
  // 销毁组件
  return base64;
}
