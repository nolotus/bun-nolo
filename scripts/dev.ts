import { handleRequest } from "server/request";

import { runBuild } from "./bunBuild";

await runBuild();
// 启动 http 服务器
Bun.serve({
  port: 80,
  hostname: "0.0.0.0",
  fetch: handleRequest,
});
