import * as esbuild from "esbuild";
import stylexPlugin from "@stylexjs/esbuild-plugin";
import path from "path";

await esbuild.build({
  entryPoints: ["./packages/server/entry.ts"],
  bundle: true,
  platform: "node",
  outfile: "dist/server.js",
});
