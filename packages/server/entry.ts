// entry.ts

import { serve, file as bunFile } from "bun"; // ✅ 显式导入 Bun 能力
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
import { handleBrowserTool } from "./handlers/browserToolHandler";
import { handleGetTransactions } from "./handlers/getTransactionsHandler";
import { handleApplyDiff } from "./handlers/applyDiffHandler"; // ✅ apply-diff 处理器

// 端口常量，方便后续统一修改
const HTTP_PORT = 80;
const HTTPS_PORT = 443;

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

// 小工具函数：统一创建 OPTIONS 响应
const createOptionsResponse = () =>
  new Response(null, { status: 204, headers: corsHeaders });

// 路由定义
const apiRoutes = {
  // 为 /public 目录下的静态文件提供服务，并设置 1 天浏览器缓存
  "/public/*": (req: Request) => {
    const filePath = new URL(req.url).pathname.substring("/public/".length);
    return new Response(bunFile(`public/${filePath}`), {
      headers: { "Cache-Control": "public, max-age=86400" }, // 缓存 1 天
    });
  },

  "/api/status": new Response("OK"),

  [API_ENDPOINTS.HI]: {
    GET: () => new Response(JSON.stringify({ API_VERSION })),
  },

  [API_ENDPOINTS.CHAT]: {
    POST: (req: Request) => handleChatRequest(req, corsHeaders),
    OPTIONS: () => createOptionsResponse(),
  },

  // 交易记录查询路由
  [API_ENDPOINTS.TRANSACTIONS]: {
    POST: (req: Request) => handleGetTransactions(req),
    OPTIONS: () => createOptionsResponse(),
  },

  "/api/fetch-webpage": {
    POST: handleFetchWebpage,
    OPTIONS: () => createOptionsResponse(),
  },

  // 浏览器工具的统一路由
  "/api/browser-tool": {
    POST: (req: Request) => handleBrowserTool(req),
    OPTIONS: () => createOptionsResponse(),
  },

  // ✅ 新增：apply diff 工具路由（供前端 AI 调用）
  "/api/apply-diff": {
    POST: (req: Request) => handleApplyDiff(req),
    OPTIONS: () => createOptionsResponse(),
  },

  ...databaseRoutes,
  ...sqliteRoutes,
};

// 启动 HTTP/HTTPS 服务器
const startServer = () => {
  console.log("isProduction:", isProduction);

  // 通用服务器配置
  const serverOptions = {
    routes: apiRoutes, // 使用 Bun 的 routes 特性
    idleTimeout: 60,
    hostname: "0.0.0.0",
    fetch: handleRequest, // 未命中 routes 时的备用处理器
    websocket: {
      message: (ws: any, _message: any) => ws.send(`Received`),
    },
  };

  // 启动 HTTP 服务
  serve({ ...serverOptions, port: HTTP_PORT });
  console.log(`HTTP server started on port ${HTTP_PORT}`);

  // 在生产环境中启动 HTTPS 服务
  if (isProduction) {
    serve({
      ...serverOptions,
      port: HTTPS_PORT,
      tls: {
        key: bunFile("./key.pem"),
        cert: bunFile("./cert.pem"),
      },
    });
    console.log(`HTTPS server started on port ${HTTPS_PORT}`);
  } else {
    console.log("HTTPS server not started (not in production mode)");
  }

  // 如需定时任务，取消下一行注释
  // startTasks();
};

startServer();
