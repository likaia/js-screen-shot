export class DrawArrow {
  // 起始点与结束点
  private beginPoint = { x: 0, y: 0 };
  private stopPoint = { x: 0, y: 0 };
  // 多边形的尺寸信息
  private polygonVertex: Array<number> = [];
  // 起点与X轴之间的夹角角度值
  private angle = 0;
  // 箭头信息
  private arrowInfo = {
    edgeLen: 50, // 箭头的头部长度
    angle: 30 // 箭头的头部角度
  };
  private size = 1;

  /**
   * 绘制箭头
   * @param ctx 需要进行绘制的画布
   * @param originX 鼠标按下时的x轴坐标
   * @param originY 鼠标按下式的y轴坐标
   * @param x 当前鼠标x轴坐标
   * @param y 当前鼠标y轴坐标
   * @param color 箭头颜色
   * @param size 箭头尺寸
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    originX: number,
    originY: number,
    x: number,
    y: number,
    color: string,
    size: number
  ) {
    this.beginPoint.x = originX;
    this.beginPoint.y = originY;
    this.stopPoint.x = x;
    this.stopPoint.y = y;
    this.arrowCord(this.beginPoint, this.stopPoint);
    this.sideCord();
    this.drawArrow(ctx, color);
    switch (size) {
      case 2:
        this.size = 1;
        break;
      case 5:
        this.size = 1.3;
        break;
      case 10:
        this.size = 1.7;
        break;
      default:
        this.size = 1;
        break;
    }
  }

  // 计算箭头底边两个点位置信息
  private arrowCord(
    beginPoint: { x: number; y: number },
    stopPoint: { x: number; y: number }
  ) {
    this.polygonVertex[0] = beginPoint.x;
    // 多边形的第一个顶点设为起点
    this.polygonVertex[1] = beginPoint.y;
    this.polygonVertex[6] = stopPoint.x;
    // 第七个顶点设为终点
    this.polygonVertex[7] = stopPoint.y;
    // 计算夹角
    this.getRadian(beginPoint, stopPoint);
    // 使用三角函数计算出8、9顶点的坐标
    this.polygonVertex[8] =
      stopPoint.x -
      this.arrowInfo.edgeLen *
        Math.cos((Math.PI / 180) * (this.angle + this.arrowInfo.angle));
    this.polygonVertex[9] =
      stopPoint.y -
      this.arrowInfo.edgeLen *
        Math.sin((Math.PI / 180) * (this.angle + this.arrowInfo.angle));
    // 使用三角函数计算出4、5顶点的坐标
    this.polygonVertex[4] =
      stopPoint.x -
      this.arrowInfo.edgeLen *
        Math.cos((Math.PI / 180) * (this.angle - this.arrowInfo.angle));
    this.polygonVertex[5] =
      stopPoint.y -
      this.arrowInfo.edgeLen *
        Math.sin((Math.PI / 180) * (this.angle - this.arrowInfo.angle));
  }

  // 计算两个点之间的夹角
  private getRadian(
    beginPoint: { x: number; y: number },
    stopPoint: { x: number; y: number }
  ) {
    // 使用atan2算出夹角（弧度），并将其转换为角度值(弧度 / 180)
    this.angle =
      (Math.atan2(stopPoint.y - beginPoint.y, stopPoint.x - beginPoint.x) /
        Math.PI) *
      180;

    this.setArrowInfo(50 * this.size, 30 * this.size);
    this.dynArrowSize();
  }

  // 计算另两个底边侧面点
  private sideCord() {
    const midpoint: { x: number; y: number } = { x: 0, y: 0 };

    midpoint.x = (this.polygonVertex[4] + this.polygonVertex[8]) / 2;
    // 通过求出第5个顶点和第9个顶点的横纵坐标的平均值，得到多边形的中心点坐标，
    midpoint.y = (this.polygonVertex[5] + this.polygonVertex[9]) / 2;
    this.polygonVertex[2] = (this.polygonVertex[4] + midpoint.x) / 2;
    this.polygonVertex[3] = (this.polygonVertex[5] + midpoint.y) / 2;
    this.polygonVertex[10] = (this.polygonVertex[8] + midpoint.x) / 2;
    this.polygonVertex[11] = (this.polygonVertex[9] + midpoint.y) / 2;
  }

  /**
   * 设置箭头的相关绘制信息
   * @param edgeLen 长度
   * @param angle 角度
   * @private
   */
  private setArrowInfo(edgeLen: number, angle: number) {
    this.arrowInfo.edgeLen = edgeLen;
    this.arrowInfo.angle = angle;
  }

  // 计算箭头尺寸
  private dynArrowSize() {
    const x = this.stopPoint.x - this.beginPoint.x;
    const y = this.stopPoint.y - this.beginPoint.y;
    // 计算两点之间的直线距离
    const length = Math.sqrt(x ** 2 + y ** 2);

    // 根据箭头始点和终点之间的距离自适应地调整箭头大小。
    if (length < 50) {
      this.arrowInfo.edgeLen = length / 2;
    } else if (length < 250) {
      this.arrowInfo.edgeLen /= 2;
    } else if (length < 500) {
      this.arrowInfo.edgeLen = (this.arrowInfo.edgeLen * length) / 500;
    }
  }

  // 在画布上画出递增变粗的箭头
  private drawArrow(ctx: CanvasRenderingContext2D, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(this.polygonVertex[0], this.polygonVertex[1]);
    ctx.lineTo(this.polygonVertex[2], this.polygonVertex[3]);
    ctx.lineTo(this.polygonVertex[4], this.polygonVertex[5]);
    ctx.lineTo(this.polygonVertex[6], this.polygonVertex[7]);
    ctx.lineTo(this.polygonVertex[8], this.polygonVertex[9]);
    ctx.lineTo(this.polygonVertex[10], this.polygonVertex[11]);
    ctx.closePath();
    ctx.fill();
  }
}
