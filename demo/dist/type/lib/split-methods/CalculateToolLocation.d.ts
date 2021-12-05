import { positionInfoType } from "@/lib/type/ComponentType";
/**
 * 计算截图工具栏位置
 * @param position 裁剪框位置信息
 * @param toolWidth 截图工具栏宽度
 */
export declare function calculateToolLocation(position: positionInfoType, toolWidth: number): {
    mouseX: number;
    mouseY: number;
};
