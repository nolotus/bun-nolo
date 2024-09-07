const path = require("path");
const os = require("os");

module.exports = {
  apps: [
    {
      name: "nolo",
      script: "packages/server/entry.ts",
      interpreter: path.join(os.homedir(), ".bun/bin/bun"),
    },
  ],
};
