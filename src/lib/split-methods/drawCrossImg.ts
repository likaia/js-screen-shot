export function drawCrossImg(html: Document) {
  const promises: Promise<string>[] = [];
  const imageNodes = html.querySelectorAll("img");
  imageNodes.forEach(element => {
    const href = element.getAttribute("src");
    if (!href) return;
    if (href && href.startsWith("base64")) return;
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = `${href}&time=${+new Date().getTime()}`;
      img.onload = function() {
        const width = element.width;
        const height = element.height;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx: any = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const base64 = canvas?.toDataURL();
        element.setAttribute("src", base64);
        resolve("转换成功");
      };
      img.onerror = reject;
      if (href !== null) {
        img.src = href;
      }
    });
    promises.push(promise as Promise<string>);
  });
  return Promise.all(promises);
}
