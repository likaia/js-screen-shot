export declare type cutOutBoxBorder = {
    x: number;
    y: number;
    width: number;
    height: number;
    index: number;
    option: number;
};
export declare type movePositionType = {
    moveStartX: number;
    moveStartY: number;
};
export declare type positionInfoType = {
    startX: number;
    startY: number;
    width: number;
    height: number;
};
export declare type zoomCutOutBoxReturnType = {
    tempStartX: number;
    tempStartY: number;
    tempWidth: number;
    tempHeight: number;
};
export declare type drawCutOutBoxReturnType = {
    startX: number;
    startY: number;
    width: number;
    height: number;
};
export declare type toolbarType = {
    id: number;
    title: string;
};
export declare type screenShotType = {
    enableWebRtc: boolean;
    level: number;
    canvasWidth: number;
    canvasHeight: number;
    completeCallback: Function;
    closeCallback: Function;
    triggerCallback: Function;
    cancelCallback: Function;
    position: {
        top?: number;
        left?: number;
    };
    clickCutFullScreen: boolean;
};
