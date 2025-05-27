import { isProduction } from "utils/env";
import { handleRequest } from "./handleRequest";
import { Cron } from "croner";
import { tasks } from "./tasks";
import { API_ENDPOINTS } from "database/config";
import { handleChatRequest } from "./handlers/chatHandler";
import { handleFetchWebpage } from "./handlers/fetchWebpageHandler"; // 新增导入

const startTasks = () => {
  tasks.forEach(({ interval, task }) => {
    const cron = Cron(interval, task);
    cron.trigger();
  });
};

// 定义路由配置，只处理 chat 相关路由和新添加的网页访问路由
const apiRoutes = {
  "/api/status": new Response("OK"),
  [API_ENDPOINTS.CHAT]: {
    POST: async (req) => {
      // 设置 CORS 头，允许所有来源
      const headers = {
        "Access-Control-Allow-Origin": "*", // 允许所有域名访问
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400", // 缓存 24 小时
      };

      // 处理 OPTIONS 请求（预检请求）
      if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers });
      }

      // 调用实际的处理函数
      return await handleChatRequest(req, headers);
    },
  },
  "/api/fetch-webpage": {
    POST: handleFetchWebpage, // 使用从单独文件中导入的处理函数
  },
};

// 以下是 httpServer 和 startServer 的代码，未做修改
const httpServer = () => {
  // 输出 isProduction 的值
  console.log("isProduction:", isProduction);

  // 启动 http 服务器
  Bun.serve({
    routes: apiRoutes,
    idleTimeout: 60,
    port: 80,
    hostname: "0.0.0.0",
    fetch: handleRequest, // 其他未匹配的路由仍然通过 handleRequest 处理
    websocket: {
      async message(ws, message) {
        ws.send(`Received`);
      },
    },
  });

  if (isProduction) {
    console.log("Starting HTTPS server on port 443");
    Bun.serve({
      idleTimeout: 60,
      routes: apiRoutes,
      port: 443,
      hostname: "0.0.0.0",
      fetch: handleRequest, // 其他未匹配的路由仍然通过 handleRequest 处理
      websocket: {
        async message(ws, message) {
          ws.send(`Received`);
        },
      },
      tls: {
        key: Bun.file("./key.pem"),
        cert: Bun.file("./cert.pem"),
      },
    });
  } else {
    console.log("HTTPS server not started (not in production mode)");
  }
};

export const startServer = () => {
  console.log("start httpServer");
  httpServer();
  console.log("end httpServer");

  // startTasks();
};

startServer();
