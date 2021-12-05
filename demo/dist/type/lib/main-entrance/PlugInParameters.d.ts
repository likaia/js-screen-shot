export default class PlugInParameters {
    constructor();
    setInitStatus(status: boolean): void;
    getInitStatus(): boolean;
    getWebRtcStatus(): boolean;
    setWebRtcStatus(status: boolean): void;
    getCanvasSize(): {
        canvasWidth: number;
        canvasHeight: number;
    };
    setCanvasSize(width: number, height: number): void;
}
