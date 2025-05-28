import { isProduction } from "utils/env";
import { handleRequest } from "./handleRequest";
import { Cron } from "croner";
import { tasks } from "./tasks";
import { API_ENDPOINTS, API_VERSION } from "database/config";
import { handleChatRequest } from "./handlers/chatHandler";
import { handleFetchWebpage } from "./handlers/fetchWebpageHandler";
import { handleReadSingle } from "database/server/read"; // 导入 read 处理函数

const startTasks = () => {
  tasks.forEach(({ interval, task }) => {
    const cron = Cron(interval, task);
    cron.trigger();
  });
};

// 定义路由配置，参考 Bun.serve 示例
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
  },

  // 动态路由：处理数据库 read 操作，支持 /api/v1/db/read/:id
  [`${API_ENDPOINTS.DATABASE}/read/:id`]: (req) => {
    const { id } = req.params; // 直接从 req.params 获取 id，Bun 会自动解析
    req.params = { id }; // 将 id 存入 req.params 以供处理函数使用
    return handleReadSingle(req, {}); // 传递 req 和一个空对象，实际可能需要调整
  },
};

// 以下是 httpServer 和 startServer 的代码
const httpServer = () => {
  console.log("isProduction:", isProduction);

  // 启动 http 服务器
  Bun.serve({
    routes: apiRoutes, // 使用定义好的路由配置
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
