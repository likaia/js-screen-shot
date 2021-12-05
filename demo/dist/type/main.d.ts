import "@/assets/scss/screen-short.scss";
import { screenShotType } from "@/lib/type/ComponentType";
export default class ScreenShort {
    private readonly data;
    private readonly videoController;
    private readonly screenShortController;
    private readonly toolController;
    private screenShortImageController;
    private screenShortCanvas;
    private readonly textInputController;
    private optionController;
    private optionIcoController;
    private drawGraphPosition;
    private tempGraphPosition;
    private cutOutBoxBorderArr;
    private borderOption;
    private movePosition;
    private clickFlag;
    private dragFlag;
    private clickCutFullScreen;
    private drawGraphPrevX;
    private drawGraphPrevY;
    private fontSize;
    private maxUndoNum;
    private degreeOfBlur;
    private position;
    private textInputPosition;
    constructor(options: screenShotType);
    getCanvasController(): HTMLCanvasElement | null;
    private load;
    private startCapture;
    private stopCapture;
    private screenShot;
    private mouseDownEvent;
    private mouseMoveEvent;
    private mouseUpEvent;
    /**
     * 操作裁剪框
     * @param currentX 裁剪框当前x轴坐标
     * @param currentY 裁剪框当前y轴坐标
     * @param startX 鼠标x轴坐标
     * @param startY 鼠标y轴坐标
     * @param width 裁剪框宽度
     * @param height 裁剪框高度
     * @param context 需要进行绘制的canvas画布
     * @private
     */
    private operatingCutOutBox;
    /**
     * 显示最新的画布状态
     * @private
     */
    private showLastHistory;
    /**
     * 保存当前画布状态
     * @private
     */
    private addHistory;
}
