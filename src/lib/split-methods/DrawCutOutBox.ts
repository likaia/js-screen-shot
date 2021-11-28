/**
 * 绘制裁剪框
 * @param mouseX 鼠标x轴坐标
 * @param mouseY 鼠标y轴坐标
 * @param width 裁剪框宽度
 * @param height 裁剪框高度
 * @param context 需要进行绘制的canvas画布
 * @param borderSize 边框节点直径
 * @param controller 需要进行操作的canvas容器
 * @param imageController 图片canvas容器
 * @private
 */
import { imgScaling } from "@/lib/common-methords/ImgScaling";
import PlugInParameters from "@/lib/main-entrance/PlugInParameters";

export function drawCutOutBox(
  mouseX: number,
  mouseY: number,
  width: number,
  height: number,
  context: CanvasRenderingContext2D,
  borderSize: number,
  controller: HTMLCanvasElement,
  imageController: HTMLCanvasElement,
  drawBorders = true
) {
  // 获取画布宽高
  const canvasWidth = controller?.width;
  const canvasHeight = controller?.height;
  const plugInParameters = new PlugInParameters();

  // 画布、图片不存在则return
  if (!canvasWidth || !canvasHeight || !imageController || !controller) return;

  // 清除画布
  context.clearRect(0, 0, canvasWidth, canvasHeight);

  // 绘制蒙层
  context.save();
  context.fillStyle = "rgba(0, 0, 0, .6)";
  context.fillRect(0, 0, canvasWidth, canvasHeight);
  // 将蒙层凿开
  context.globalCompositeOperation = "source-atop";
  // 裁剪选择框
  context.clearRect(mouseX, mouseY, width, height);
  // 绘制8个边框像素点并保存坐标信息以及事件参数
  context.globalCompositeOperation = "source-over";
  context.fillStyle = "#2CABFF";
  // 是否绘制裁剪框的8个像素点
  if (drawBorders) {
    // 像素点大小
    const size = borderSize;
    // 绘制像素点
    context.fillRect(mouseX - size / 2, mouseY - size / 2, size, size);
    context.fillRect(
      mouseX - size / 2 + width / 2,
      mouseY - size / 2,
      size,
      size
    );
    context.fillRect(mouseX - size / 2 + width, mouseY - size / 2, size, size);
    context.fillRect(
      mouseX - size / 2,
      mouseY - size / 2 + height / 2,
      size,
      size
    );
    context.fillRect(
      mouseX - size / 2 + width,
      mouseY - size / 2 + height / 2,
      size,
      size
    );
    context.fillRect(mouseX - size / 2, mouseY - size / 2 + height, size, size);
    context.fillRect(
      mouseX - size / 2 + width / 2,
      mouseY - size / 2 + height,
      size,
      size
    );
    context.fillRect(
      mouseX - size / 2 + width,
      mouseY - size / 2 + height,
      size,
      size
    );
  }
  // 绘制结束
  context.restore();
  // 使用drawImage将图片绘制到蒙层下方
  context.save();

  // 获取图片canvas容器的宽高信息
  // const imgWidth = imageController.width;
  // const imgHeight = imageController.height;
  // // 修改图片canvas容器的宽高，用原宽高 * 当前设备的像素比，解决模糊问题
  // imageController.width = imgWidth * window.devicePixelRatio;
  // imageController.height =
  //   imgHeight * window.devicePixelRatio;
  // imageController.style.width = imgWidth + "px";
  // imageController.style.height = imgHeight + "px";
  // context.scale(window.devicePixelRatio, window.devicePixelRatio);

  context.globalCompositeOperation = "destination-over";
  let { imgWidth, imgHeight } = {
    imgWidth: controller?.width,
    imgHeight: controller?.height
  };
  if (plugInParameters.getWebRtcStatus()) {
    // // 计算等比例缩放后的图片宽高
    // const { tempWidth, tempHeight } = imgScaling(
    //   window.screen.width,
    //   window.screen.height,
    //   controller.width,
    //   controller.height
    // );
    // imgWidth = tempWidth;
    // imgHeight = tempHeight;
    // 计算等比例缩放后的图片宽高
    // const { tempWidth, tempHeight } = imgScaling(
    //   window.screen.width,
    //   window.screen.height,
    //   controller.width,
    //   controller.height
    // );
    // imgWidth = tempWidth;
    // imgHeight = tempHeight;

    // 使用当前屏幕宽高
    imgWidth = window.screen.width;
    imgHeight = window.screen.height;
  }

  context.drawImage(imageController, 0, 0, imgWidth, imgHeight);
  context.restore();
  // 返回裁剪框临时位置信息
  return {
    startX: mouseX,
    startY: mouseY,
    width: width,
    height: height
  };
}
