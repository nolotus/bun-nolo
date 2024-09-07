module.exports = {
  apps: [
    {
      name: "nolo",
      script: "packages/server/entry.ts",
      interpreter: "~/.bun/bin/bun",
    },
  ],
};
