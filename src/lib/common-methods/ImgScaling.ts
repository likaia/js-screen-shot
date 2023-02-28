/**
 * 等比例缩放图片
 * @param imgWidth
 * @param imgHeight
 * @param containerWidth
 * @param containerHeight
 */
export function imgScaling(
  imgWidth: number,
  imgHeight: number,
  containerWidth: number,
  containerHeight: number
) {
  let [tempWidth, tempHeight] = [0, 0];

  if (imgWidth > 0 && imgHeight > 0) {
    // 原图片宽高比例 大于 指定的宽高比例，这就说明了原图片的宽度必然 > 高度
    if (imgWidth / imgHeight >= containerWidth / containerHeight) {
      if (imgWidth > containerWidth) {
        tempWidth = containerWidth;
        // 按原图片的比例进行缩放
        tempHeight = (imgHeight * containerWidth) / imgWidth;
      } else {
        // 按照图片的大小进行缩放
        tempWidth = imgWidth;
        tempHeight = imgHeight;
      }
    } else {
      // 原图片的高度必然 > 宽度
      if (imgHeight > containerHeight) {
        tempHeight = containerHeight;
        // 按原图片的比例进行缩放
        tempWidth = (imgWidth * containerHeight) / imgHeight;
      } else {
        // 按原图片的大小进行缩放
        tempWidth = imgWidth;
        tempHeight = imgHeight;
      }
    }
  }

  return { tempWidth, tempHeight };
}
