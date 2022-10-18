/**
 * 取出一条历史记录
 */
import InitData from "@/lib/main-entrance/InitData";

export function takeOutHistory() {
  const data = new InitData();
  data.popHistory();
  const screenShortCanvas = data.getScreenShotContainer()?.getContext("2d");
  if (screenShortCanvas != null) {
    if (data.getHistory().length > 0) {
      screenShortCanvas.putImageData(
        data.getHistory()[data.getHistory().length - 1]["data"],
        0,
        0
      );
    }
  }

  data.setUndoClickNum(data.getUndoClickNum() + 1);
  // 历史记录已取完，禁用撤回按钮点击
  if (data.getHistory().length - 1 <= 0) {
    data.setUndoClickNum(0);
    data.setUndoStatus(false);
  }
}
