import postCssPlugin from "esbuild-style-plugin";
import { isProduction } from "utils/env";
import stylexPlugin from "@stylexjs/esbuild-plugin";
import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const inputPath = "./packages/web/entry.tsx";
// 定义公共配置
const commonConfig = {
  entryPoints: [inputPath],
  outdir: "public/assets",
  plugins: [
    stylexPlugin({
      // If set to 'true', bundler will inject styles in-line
      // Do not use in production
      dev: false,
      // Required. File path for the generated CSS file
      generatedCSSFileName: path.resolve("public/assets/stylex.css"),
      // Aliases for StyleX package imports
      // default: '@stylexjs/stylex'
      stylexImports: ["@stylexjs/stylex"],
      // Required for CSS variable support
      unstable_moduleResolution: {
        // type: 'commonJS' | 'ESModules' | 'haste'
        // default: 'commonJS'
        type: "commonJS",
        // The absolute path to the root of your project
        rootDir: __dirname,
      },
    }),
    postCssPlugin({
      postcss: {
        plugins: [require("tailwindcss"), require("autoprefixer")],
      },
    }),
  ],
  bundle: true,
  splitting: true,
  treeShaking: true,
  format: "esm",
  loader: {
    ".js": "jsx",
    ".webp": "file",
    ".jpg": "file",
    ".png": "file",
    ".svg": "text",
  },
  metafile: true,
};

// 定义生产环境特有配置
const prodConfig = {
  entryNames: "[dir]/[name]-[hash]",
  minify: true,
  sourcemap: false,
};

// 合并配置，如果是生产环境，添加 prodConfig
export const config = isProduction
  ? { ...commonConfig, ...prodConfig }
  : commonConfig;
