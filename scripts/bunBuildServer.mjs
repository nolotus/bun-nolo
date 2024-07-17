const result = await Bun.build({
  entrypoints: ["./packages/server/entry.ts"],
  outdir: "./dist",
  target: "bun",
});
