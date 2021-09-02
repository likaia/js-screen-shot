module.exports = {
  // 强制css内联，不然会导致样式失效问题
  css: { extract: false },
  assetsDir: "static",
  productionSourceMap: false,
  chainWebpack: config => {
    if (process.env.NODE_ENV === "production") {
      config.module.rule("ts").uses.delete("cache-loader");
      config.module
        .rule("ts")
        .use("ts-loader")
        .loader("ts-loader")
        .tap(opts => {
          opts.transpileOnly = false;
          opts.happyPackMode = false;
          return opts;
        });
    }
  },
  // 自定义webpack配置
  configureWebpack: {
    output: {
      // 对外暴露default属性
      libraryExport: "default"
    }
  },
  parallel: false
};
