import { getCanvas2dCtx } from "@/lib/common-methods/CanvasPatch";

export function saveCanvasToImage(
  context: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  width: number,
  height: number
) {
  // 获取设备像素比
  const dpr = window.devicePixelRatio || 1;
  // 获取裁剪框区域图片信息
  // 获取裁剪框区域图片信息
  const img = context.getImageData(
    startX * dpr,
    startY * dpr,
    width * dpr,
    height * dpr
  );
  // 创建canvas标签，用于存放裁剪区域的图片
  const canvas = document.createElement("canvas");
  // 获取裁剪框区域画布
  const imgContext = getCanvas2dCtx(canvas, width, height);
  if (imgContext) {
    // 将图片放进裁剪框内
    imgContext.putImageData(img, 0, 0);
    const a = document.createElement("a");
    // 获取图片
    a.href = canvas.toDataURL("png");
    // 下载图片
    a.download = `${new Date().getTime()}.png`;
    a.click();
  }
}
