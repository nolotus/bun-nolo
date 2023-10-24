const env = process.env.NODE_ENV;
const isProduction = env === "production";

const commonConfig = {
  entrypoints: ["./packages/web/entry.tsx"],
  outdir: "./public",
  naming: "[dir]/[name]-[hash].[ext]",
  sourcemap: "external",
};

const productionConfig = {
  ...commonConfig,
  minify: {
    whitespace: true,
    identifiers: true,
    syntax: true,
  },
};

const config = isProduction ? productionConfig : commonConfig;

export async function runBuild() {
  try {
    const result = await Bun.build(config);
    let filename = result.outputs[0].path.split("/").pop(); // 这里获得文件名
    let json = { path: filename };
    await Bun.write("./public/output.json", JSON.stringify(json));

    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

runBuild();
// const serverConfig = {
//   entrypoints: ["./packages/server/entry.tsx"],
//   outdir: "./build",
//   naming: "[dir]/[name].[ext]",
//   sourcemap: "external",
//   target: "bun",
//   external: ["argon2-browser"],
// };

// const result = await Bun.build(serverConfig);
// let firstFileRef = result.outputs[0];
