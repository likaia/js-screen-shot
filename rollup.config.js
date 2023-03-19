import typescript from "rollup-plugin-typescript2";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import postcss from "rollup-plugin-postcss";
import autoprefixer from "autoprefixer";
import copy from "rollup-plugin-copy";
import path from "path";
import alias from "@rollup/plugin-alias";
import postcssImport from "postcss-import";
import postcssUrl from "postcss-url";
import url from "@rollup/plugin-url";
import cssnano from "cssnano";
import yargs from "yargs";
import {
  buildConfig,
  buildCopyTargetsConfig,
  enableDevServer,
  enablePKGStats,
  buildTSConfig
} from "./rollup-utils";
import progress from "rollup-plugin-progress";

// 使用yargs解析命令行执行时的添加参数
const commandLineParameters = yargs(process.argv.slice(1)).options({
  // css文件独立状态,默认为内嵌
  splitCss: { type: "string", alias: "spCss", default: "false" },
  // 打包格式, 默认为 umd,esm,common 三种格式
  packagingFormat: {
    type: "string",
    alias: "pkgFormat",
    default: "umd,esm,common"
  },
  // 打包后的js压缩状态
  compressedState: { type: "string", alias: "compState", default: "false" },
  // 显示每个包的占用体积, 默认不显示
  showModulePKGInfo: { type: "string", alias: "showPKGInfo", default: "false" },
  // 是否开启devServer, 默认不开启
  useDevServer: { type: "string", alias: "useDServer", default: "false" }
}).argv;
// 需要让rollup忽略的自定义参数
const ignoredWarningsKey = [...Object.keys(commandLineParameters)];
const splitCss = commandLineParameters.splitCss;
const packagingFormat = commandLineParameters.packagingFormat.split(",");
const compressedState = commandLineParameters.compressedState;
const showModulePKGInfo = commandLineParameters.showModulePKGInfo;
const useDevServer = commandLineParameters.useDevServer;

export default {
  input: "src/main.ts",
  output: buildConfig(packagingFormat, compressedState),
  // 警告处理钩子
  onwarn: function(warning, rollupWarn) {
    const message = warning.message;
    let matchingResult = false;
    for (let i = 0; i < ignoredWarningsKey.length; i++) {
      if (message.indexOf(ignoredWarningsKey[i]) !== -1) {
        matchingResult = true;
        break;
      }
    }
    // 错误警告中包含要忽略的key则退出函数
    if (warning.code === "UNKNOWN_OPTION" && matchingResult) {
      return;
    }
    rollupWarn(warning);
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    alias({
      entries: [{ find: "@", replacement: path.resolve(__dirname, "src") }]
    }),
    typescript(buildTSConfig(useDevServer)),
    // 此处用来处理外置css, 需要在入口文件中使用import来导入css文件
    postcss({
      // 内联css
      extract: splitCss === "true" ? "style/css/screen-shot.css" : false,
      minimize: true,
      sourceMap: false,
      extensions: [".css", ".scss"],
      // 当前正在处理的CSS文件的路径, postcssUrl在拷贝资源时需要根据它来定位目标文件
      to: path.resolve(__dirname, "dist/assets/*"),
      use: ["sass"],
      // autoprefixer: 给css3的一些属性加前缀
      // postcssImport: 处理css文件中的@import语句
      // cssnano: 它可以通过移除注释、空格和其他不必要的字符来压缩CSS代码
      plugins: [
        autoprefixer(),
        postcssImport(),
        // 对scss中的别名进行统一替换处理
        postcssUrl([
          {
            filter: "**/*.*",
            url(asset) {
              return asset.url.replace(/~@/g, ".");
            }
          }
        ]),
        // 再次调用将css中引入的图片按照规则进行处理
        postcssUrl([
          {
            basePath: path.resolve(__dirname, "src"),
            url: "inline",
            maxSize: 8, // 最大文件大小（单位为KB），超过该大小的文件将不会被编码为base64
            fallback: "copy", // 如果文件大小超过最大大小，则使用copy选项复制文件
            useHash: true, // 进行hash命名
            encodeType: "base64" // 指定编码类型为base64
          }
        ]),
        cssnano({
          preset: "default" // 使用默认配置
        })
      ]
    }),
    // 处理通过img标签引入的图片
    url({
      include: ["**/*.jpg", "**/*.png", "**/*.svg"],
      // 输出路径
      dest: "dist/assets",
      // 超过10kb则拷贝否则转base64
      limit: 10 * 1024 // 10KB
    }),
    babel({
      exclude: "node_modules/**",
      babelHelpers: "bundled",
      bundled: "auto"
    }),
    enablePKGStats(showModulePKGInfo),
    ...enableDevServer(useDevServer),
    progress({
      format: "[:bar] :percent (:current/:total)",
      clearLine: false
    }),
    copy({
      targets: buildCopyTargetsConfig(useDevServer)
    })
  ]
};
