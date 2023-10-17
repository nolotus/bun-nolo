import {runBuild} from './build'

import { handleRequest } from "server/request";
await runBuild()
// 启动 http 服务器
Bun.serve({
  port: 80,
  hostname: "0.0.0.0",
  fetch: handleRequest,
});
