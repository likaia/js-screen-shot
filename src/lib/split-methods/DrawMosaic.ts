/**
 * 获取图像指定坐标位置的颜色
 * @param imgData 需要进行操作的图片
 * @param x x点坐标
 * @param y y点坐标
 */
const getAxisColor = (imgData: ImageData, x: number, y: number) => {
  const w = imgData.width;
  const d = imgData.data;
  const color = [];
  color[0] = d[4 * (y * w + x)];
  color[1] = d[4 * (y * w + x) + 1];
  color[2] = d[4 * (y * w + x) + 2];
  color[3] = d[4 * (y * w + x) + 3];
  return color;
};

/**
 * 设置图像指定坐标位置的颜色
 * @param imgData 需要进行操作的图片
 * @param x x点坐标
 * @param y y点坐标
 * @param color 颜色数组
 */
const setAxisColor = (
  imgData: ImageData,
  x: number,
  y: number,
  color: Array<number>
) => {
  const w = imgData.width;
  const d = imgData.data;
  d[4 * (y * w + x)] = color[0];
  d[4 * (y * w + x) + 1] = color[1];
  d[4 * (y * w + x) + 2] = color[2];
  d[4 * (y * w + x) + 3] = color[3];
};

/**
 * 绘制马赛克
 *    实现思路：
 *      1. 获取鼠标划过路径区域的图像信息
 *      2. 将区域内的像素点绘制成周围相近的颜色
 * @param mouseX 当前鼠标X轴坐标
 * @param mouseY 当前鼠标Y轴坐标
 * @param size 马赛克画笔大小
 * @param degreeOfBlur 马赛克模糊度
 * @param context 需要进行绘制的画布
 */
export function drawMosaic(
  mouseX: number,
  mouseY: number,
  size: number,
  degreeOfBlur: number,
  context: CanvasRenderingContext2D
) {
  // 获取设备像素比
  const dpr = window.devicePixelRatio || 1;
  // 获取鼠标经过区域的图片像素信息
  const imgData = context.getImageData(
    mouseX * dpr,
    mouseY * dpr,
    size * dpr,
    size * dpr
  );
  // 获取图像宽高
  const w = imgData.width;
  const h = imgData.height;
  // 等分图像宽高
  const stepW = w / degreeOfBlur;
  const stepH = h / degreeOfBlur;
  // 循环画布像素点
  for (let i = 0; i < stepH; i++) {
    for (let j = 0; j < stepW; j++) {
      // 随机获取一个小方格的随机颜色
      const color = getAxisColor(
        imgData,
        j * degreeOfBlur + Math.floor(Math.random() * degreeOfBlur),
        i * degreeOfBlur + Math.floor(Math.random() * degreeOfBlur)
      );
      // 循环小方格的像素点
      for (let k = 0; k < degreeOfBlur; k++) {
        for (let l = 0; l < degreeOfBlur; l++) {
          // 设置小方格的颜色
          setAxisColor(
            imgData,
            j * degreeOfBlur + l,
            i * degreeOfBlur + k,
            color
          );
        }
      }
    }
  }
  // 渲染打上马赛克后的图像信息
  context.putImageData(imgData, mouseX * dpr, mouseY * dpr);
}
