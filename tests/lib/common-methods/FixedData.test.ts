import { fixedData } from "@/lib/common-methods/FixedData";

describe("测试计算可视区域边界值函数", () => {
  const canvasDistance = 100;
  const trimDistance = 10;
  test("当前绘制位置超出画布", () => {
    // 超出画布时应该做修复
    expect(fixedData(canvasDistance + 1, trimDistance, canvasDistance)).toBe(
      canvasDistance - trimDistance
    );
  });

  test("当前绘制位置未超出画布", () => {
    // 未超出画布不做修复
    expect(fixedData(50, trimDistance, canvasDistance)).toBe(50);
  });

  test("当前绘制位置未超出画布且处于裁剪框内", () => {
    // 当前绘制位置未超出画布且在裁剪框内也不做修复
    expect(fixedData(5, trimDistance, canvasDistance)).toBe(5);
  });
});
