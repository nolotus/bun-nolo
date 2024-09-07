const path = require("path");
const os = require("os");

const bunPath = path.join(os.homedir(), ".bun/bin/bun");

module.exports = {
  apps: [
    {
      name: "nolo",
      script: "packages/server/entry.ts",
      interpreter: "/usr/bin/env",
      interpreter_args: "bash -c 'PATH=$PATH:$(dirname $(which bun)) exec bun'",
      env: {
        PATH: `${process.env.PATH}:${path.dirname(bunPath)}`,
      },
    },
  ],
};
