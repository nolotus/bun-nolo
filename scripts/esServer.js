import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["./packages/server/entry.ts"],
  bundle: true,
  platform: "node",
  outfile: "dist/server.js",
});
