import { isProduction } from "utils/env";
import { handleRequest } from "./handleRequest";
import { Cron } from "croner";
import { tasks } from "./tasks";
import { API_ENDPOINTS, API_VERSION } from "database/config";
import { handleChatRequest } from "./handlers/chatHandler";
import { handleFetchWebpage } from "./handlers/fetchWebpageHandler";
import { databaseRoutes } from "./databaseRoutes";

const startTasks = () => {
  tasks.forEach(({ interval, task }) => {
    const cron = Cron(interval, task);
    cron.trigger();
  });
};

// 定义主要的路由配置
const apiRoutes = {
  // 静态路由
  "/api/status": new Response("OK"),

  // API_ENDPOINTS.HI 路由
  [API_ENDPOINTS.HI]: {
    GET: () =>
      new Response(JSON.stringify({ API_VERSION }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  },

  // API_ENDPOINTS.CHAT 路由，支持 POST 和 OPTIONS
  [API_ENDPOINTS.CHAT]: {
    POST: async (req) => {
      const headers = {
        "Access-Control-Allow-Origin": "*", // 允许所有域名访问
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400", // 缓存 24 小时
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

  // /api/fetch-webpage 路由，支持 POST
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

  // 整合 databaseRoutes
  ...databaseRoutes,
};

// 以下是 httpServer 和 startServer 的代码
const httpServer = () => {
  console.log("isProduction:", isProduction);

  Bun.serve({
    routes: apiRoutes, // 使用定义好的路由配置
    idleTimeout: 60,
    port: 80,
    hostname: "0.0.0.0",
    fetch: handleRequest, // 保持原有 fetch，不做全局改动
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
  console.log("end httpServer");

  // startTasks();
};

startServer();
