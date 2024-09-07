const path = require("path");

module.exports = {
  apps: [
    {
      name: "nolo",
      script: "packages/server/entry.ts",
      interpreter:
        process.env.BUN_PATH || path.join(process.env.HOME, ".bun/bin/bun"),
    },
  ],
};
