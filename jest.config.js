module.exports = {
  // 使用ts-jest来处理ts代码
  preset: "ts-jest",
  // 输出每个测试用例执行的结果
  verbose: true,
  // 是否显示覆盖率报告
  collectCoverage: true,
  // 告诉 jest 哪些文件需要经过单元测试
  collectCoverageFrom: ["src/lib/**/*.ts", "src/*.ts"],
  testMatch: ["**/tests/**/*.test.ts", "**/tests/**/*.spec.ts"],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  coverageThreshold: {
    global: {
      statements: 90, // 保证每个语句都执行了
      functions: 90, // 保证每个函数都调用了
      branches: 90 // 保证每个 if 等分支代码都执行了
    }
  },
  // 需要忽略的目录
  testPathIgnorePatterns: ["/node_modules/", "/.rollup.cache/"],
  // 处理别名
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  // 运行时的环境
  testEnvironment: "jest-environment-jsdom"
};
