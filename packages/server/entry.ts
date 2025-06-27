// entry.ts

import { isProduction } from "utils/env";
import { handleRequest } from "./handleRequest";
import { Cron } from "croner";
import { tasks } from "./tasks";
import { API_ENDPOINTS, API_VERSION } from "database/config";
import { handleChatRequest } from "./handlers/chatHandler";
import { handleFetchWebpage } from "./handlers/fetchWebpageHandler";
import { databaseRoutes } from "./databaseRoutes";
import { sqliteRoutes } from "./sqliteRoutes";

// --- 新增引入 ---
import { handleBrowserTool } from "./handlers/browserToolHandler"; // 新增
import { handleGetTransactions } from "./handlers/getTransactionsHandler";

// 启动定时任务 (如果需要，可以取消注释)
const startTasks = () => {
  tasks.forEach(({ interval, task }) => Cron(interval, task).trigger());
};

// 提取重复的 CORS 响应头，使代码更简洁
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

// 路由定义
const apiRoutes = {
  // 新增：为 /public 目录下的静态文件提供服务，并设置1天浏览器缓存
  "/public/*": (req: Request) => {
    const filePath = new URL(req.url).pathname.substring("/public/".length);
    return new Response(Bun.file(`public/${filePath}`), {
      headers: { "Cache-Control": "public, max-age=86400" }, // 缓存1天
    });
  },

  "/api/status": new Response("OK"),
  [API_ENDPOINTS.HI]: {
    GET: () => new Response(JSON.stringify({ API_VERSION })),
  },
  [API_ENDPOINTS.CHAT]: {
    POST: (req: Request) => handleChatRequest(req, corsHeaders),
    OPTIONS: () => new Response(null, { status: 204, headers: corsHeaders }),
  },

  // --- 新增的交易记录查询路由 ---
  [API_ENDPOINTS.TRANSACTIONS]: {
    POST: (req: Request) => handleGetTransactions(req),
    OPTIONS: () => new Response(null, { status: 204, headers: corsHeaders }),
  },

  "/api/fetch-webpage": {
    POST: handleFetchWebpage,
    OPTIONS: () => new Response(null, { status: 204, headers: corsHeaders }),
  },

  // [新增] 浏览器工具的统一路由
  "/api/browser-tool": {
    POST: (req: Request) => handleBrowserTool(req),
    OPTIONS: () => new Response(null, { status: 204, headers: corsHeaders }),
  },

  ...databaseRoutes,
  ...sqliteRoutes,
};

// 启动 HTTP/HTTPS 服务器
const startServer = () => {
  console.log("isProduction:", isProduction);

  // 提取通用的服务器配置
  const serverOptions = {
    routes: apiRoutes, // 保持您原有的、正确的路由方式
    idleTimeout: 60,
    hostname: "0.0.0.0",
    fetch: handleRequest, // 备用处理器
    websocket: {
      message: (ws: any, message: any) => ws.send(`Received`),
    },
  };

  // 启动 HTTP 服务
  Bun.serve({ ...serverOptions, port: 80 });
  console.log("HTTP server started on port 80");

  // 在生产环境中启动 HTTPS 服务
  if (isProduction) {
    Bun.serve({
      ...serverOptions,
      port: 443,
      tls: {
        key: Bun.file("./key.pem"),
        cert: Bun.file("./cert.pem"),
      },
    });
    console.log("HTTPS server started on port 443");
  } else {
    console.log("HTTPS server not started (not in production mode)");
  }

  // startTasks();
};

startServer();
