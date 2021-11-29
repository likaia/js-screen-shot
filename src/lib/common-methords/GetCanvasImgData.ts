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
  if (screenShortCanvas) {
    if (isSave) {
      // 将canvas转为图片
      saveCanvasToImage(screenShortCanvas, startX, startY, width, height);
    } else {
      // 将canvas转为base64
      base64 = saveCanvasToBase64(
        screenShortCanvas,
        startX,
        startY,
        width,
        height
      );
    }
  }
  return base64;
}
