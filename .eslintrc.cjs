module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json", // 指定你的 tsconfig 文件路径
    tsconfigRootDir: __dirname, // 指定 tsconfig 文件的根目录
    ecmaVersion: 2020, // 允许现代 ECMAScript 功能
    sourceType: "module", // 允许使用 import 语句
  },
  plugins: ["@typescript-eslint", "import"],
  rules: {
    "prettier/prettier": [
      "error",
      {
        singleQuote: true,
        parser: "flow",
      },
    ],
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/warnings",
    "@react-native",
  ],
};
