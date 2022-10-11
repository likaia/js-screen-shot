// 获取canvas上下文对象，对高分屏进行修复
export function getCanvas2dCtx(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
) {
  // 获取设备像素比
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  const ctx = canvas.getContext("2d");
  // 对画布进行缩放处理
  if (ctx) {
    ctx.scale(dpr, dpr);
  }
  return ctx;
}
