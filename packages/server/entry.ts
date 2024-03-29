import { serve } from "bun";
import { isProduction } from "utils/env";
import { handleRequest } from "./request";

export const startServer = () => {
  if (isProduction) {
    serve({
      port: 443,
      hostname: "0.0.0.0",
      fetch: handleRequest,
      tls: {
        key: Bun.file("./key.pem"),
        cert: Bun.file("./cert.pem"),
      },
    });
  }

  // 启动 http 服务器
  serve({
    port: 80,
    hostname: "0.0.0.0",
    fetch: handleRequest,
  });
};
startServer();
