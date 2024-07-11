import { isProduction } from "utils/env";

const commonConfig = {
  entrypoints: ["./packages/web/entry.tsx"],
  outdir: "public",
  minify: {
    whitespace: true,
    syntax: true,
  },
  target: "browser",
};

const productionConfig = {
  ...commonConfig,
};
const config = isProduction ? productionConfig : commonConfig;

export async function runBuild() {
  // let json = {};
  try {
    const build = await Bun.build(config);
    for (const output of build.outputs) {
      const result = await output;
      if (result.kind === "entry-point") {
        // let arr = result.path.split("/");
        // let filename = arr.pop();
        // json.main = filename;
      }
    }

    // await Bun.write("./public/test.json", JSON.stringify(...result));

    // await Bun.write("./public/output.json", JSON.stringify(json));
  } catch (error) {}
}

// runBuild();
// const serverConfig = {
//   entrypoints: ["./packages/server/entry.ts"],
//   outdir: "./build",
//   naming: "[dir]/[name].[ext]",
//   sourcemap: "external",
//   target: "bun",
//   external: ["argon2-browser"],
// };

// const result = await Bun.build(serverConfig);
// let firstFileRef = result.outputs[0];
