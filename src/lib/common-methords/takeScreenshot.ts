// 捕获屏幕媒体流
export async function takeScreenshotStream() {
  const mediaDevices = navigator.mediaDevices as any;
  const width = screen.width * (window.devicePixelRatio || 1);
  const height = screen.height * (window.devicePixelRatio || 1);
  const errors = [];
  let stream = null;

  try {
    stream = await mediaDevices.getDisplayMedia({
      audio: false,
      video: {
        // @ts-ignore
        displaySurface: 'browser',
        // @ts-ignore
        // 指定webRTC媒体流默认为当前窗口打开，无需弹窗授权确认
        displaySurfaceId: `screen:${stream.id}`,
        width,
        height,
        frameRate: 4,
      }
    });
  } catch (ex) {
    errors.push(ex);
  }

  if (errors.length) {
    console.debug(...errors);
  }

  return stream;
}