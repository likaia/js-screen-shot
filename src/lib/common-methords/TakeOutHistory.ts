/**
 * 取出一条历史记录
 */
import InitData from "@/lib/main-entrance/InitData";

export function takeOutHistory() {
  const data = new InitData();
  const lastImageData = data.popHistory();
  const screenShortCanvas = data.getScreenShotContainer()?.getContext("2d");
  if (screenShortCanvas != null && lastImageData) {
    const context = screenShortCanvas;
    if (data.getUndoClickNum() == 0 && data.getHistory().length > 0) {
      // 首次取出需要取两条历史记录
      const firstPopImageData = data.popHistory() as Record<string, any>;
      context.putImageData(firstPopImageData["data"], 0, 0);
    } else {
      context.putImageData(lastImageData["data"], 0, 0);
    }
  }

  data.setUndoClickNum(data.getUndoClickNum() + 1);
  // 历史记录已取完，禁用撤回按钮点击
  if (data.getHistory().length <= 0) {
    data.setUndoClickNum(0);
    data.setUndoStatus(false);
  }
}
