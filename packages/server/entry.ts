// index.ts
import { isProduction } from "utils/env";
import { handleRequest } from "./handleRequest";
import { Cron } from "croner";
import { tasks } from "./tasks";
import { API_ENDPOINTS, API_VERSION } from "database/config";
import { handleChatRequest } from "./handlers/chatHandler";
import { handleFetchWebpage } from "./handlers/fetchWebpageHandler";
import { databaseRoutes } from "./databaseRoutes";
import { sqliteRoutes } from "./sqliteRoutes";

const startTasks = () => {
  tasks.forEach(({ interval, task }) => {
    const cron = Cron(interval, task);
    cron.trigger();
  });
};

// 新增：使用 Bun 的路由功能高效处理静态文件
const publicRoutes = {
  // 使用通配符 * 匹配 /public/ 目录下的所有文件和子目录
  "/public/*": (req: Request) => {
    const url = new URL(req.url);
    // 从路径中移除 /public/ 前缀，得到文件的相对路径
    const filePath = url.pathname.substring("/public/".length);
    // 直接返回文件响应，Bun 会自动处理 Content-Type 等头部
    return new Response(Bun.file(`public/${filePath}`));
  },
};

const apiRoutes = {
  "/api/status": new Response("OK"),
  [API_ENDPOINTS.HI]: {
    GET: () =>
      new Response(JSON.stringify({ API_VERSION }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  },
  [API_ENDPOINTS.CHAT]: {
    POST: async (req: Request) => {
      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      };
      return await handleChatRequest(req, headers);
    },
    OPTIONS: () =>
      new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      }),
  },
  "/api/fetch-webpage": {
    POST: handleFetchWebpage,
    OPTIONS: () =>
      new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      }),
  },
  ...publicRoutes, // <-- 整合静态文件路由
  ...databaseRoutes,
  ...sqliteRoutes,
};

const httpServer = () => {
  console.log("isProduction:", isProduction);

  Bun.serve({
    routes: apiRoutes,
    idleTimeout: 60,
    port: 80,
    hostname: "0.0.0.0",
    fetch: handleRequest, // 这个 fetch 现在是备用处理器，用于处理 routes 中未匹配的请求
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
      fetch: handleRequest,
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
  // startTasks();
  console.log("end httpServer");
};

startServer();
