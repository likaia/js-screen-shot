"use strict";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

function resolve(dir) {
  return path.join(__dirname, ".", dir);
}

module.exports = {
  context: path.resolve(__dirname, "./"),
  resolve: {
    extensions: [".js", ".vue", ".json"],
    alias: {
      "@": resolve("src"),
      "@views": resolve("src/views"),
      "@comp": resolve("src/components"),
      "@core": resolve("src/core"),
      "@utils": resolve("src/utils")
    }
  }
};
