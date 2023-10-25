import { handleRequest } from "./request";
import { serve } from "bun";
import { esbuildClient } from "../../scripts/esbuild";
await esbuildClient();
//
export const startServer = () => {
  if (process.env.NODE_ENV === "production") {
    serve({
      port: 443,
      hostname: "0.0.0.0",
      fetch: handleRequest,
      tls: {
        key: Bun.file("./key.pem"),
        cert: Bun.file("./cert.pem"),
        ca: Bun.file("./ca.pem"),
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
