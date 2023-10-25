import * as esbuild from "esbuild";
import fs from "node:fs";
import autoprefixer from "autoprefixer";
import postCssPlugin from "esbuild-style-plugin";

// import publicPath from "../public/output.json";
// const inputPath = "./packages/web/entry.tsx";
// const config = {
//   entryPoints: [inputPath],
//   entryNames: "[dir]/[name]-[hash]",
//   bundle: true,
//   outdir: "public",
//   format: "esm",
//   loader: {
//     // 将 JavaScript 文件作为 JSX 加载
//     ".js": "jsx",
//     // 将 WebP 文件作为文件加载
//     ".webp": "file",
//     // 将 JPEG 文件作为文件加载
//     ".jpg": "file",
//     // 将 PNG 文件作为文件加载
//     ".png": "file",
//     // 将 SVG 文件作为文本加载
//     ".svg": "text",
//   },
// };

// console.log(await esbuild.analyzeMetafile(result.metafile));
// export const esbuildClient = async () => {
//   const before = publicPath.main;
//   let result = await esbuild.build({ ...config, write: false });
//   const arr = result.outputFiles[0].path.split("/");
//   const filename = arr[4];
//   const json = { main: filename };
//   const str = new TextDecoder().decode(result.outputFiles[0].contents);
//   if (filename !== before) {
//     console.log("esbuildClient", result);
//     fs.writeFileSync(`./public/${filename}`, str);
//     fs.writeFileSync("./public/output.json", JSON.stringify(json));
//   }
// };
// esbuildClient();

const config = {
  entryPoints: ["./packages/web/entry.tsx"],
  outdir: "public",
  plugins: [
    postCssPlugin({
      postcss: {
        plugins: [require("tailwindcss"), require("autoprefixer")],
      },
    }),
  ],
  bundle: true,
  // splitting: true,
  // format: "esm",
  loader: {
    // 将 JavaScript 文件作为 JSX 加载
    ".js": "jsx",
    // 将 WebP 文件作为文件加载
    ".webp": "file",
    // 将 JPEG 文件作为文件加载
    ".jpg": "file",
    // 将 PNG 文件作为文件加载
    ".png": "file",
    // 将 SVG 文件作为文本加载
    ".svg": "text",
  },
};
let result = await esbuild.build(config);
console.log("build", result);
