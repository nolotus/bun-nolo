import { handleRequest } from "./request";
// 根据环境变量决定是否启动 https 服务器
if (process.env.NODE_ENV === "production") {
  Bun.serve({
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
Bun.serve({
  port: 80,
  hostname: "0.0.0.0",
  fetch: handleRequest,
});
