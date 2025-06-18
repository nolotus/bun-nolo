// server/handleRequest.ts
import { pino } from "pino";
import { authServerRoutes } from "auth/server/route";
import { handleToken } from "auth/server/token";
import { API_VERSION, API_ENDPOINTS } from "database/config";
import { databaseRequest } from "database/server/routes";
import { weatherRouteHandler } from "integrations/weather";
import { createResponse } from "./createResponse";
import { handleRender } from "./render";
import { handleRPCRequest } from "./handleRPCRequest";

const logger = pino({ name: "server:request" });
const res = createResponse();

// 注意：这个函数现在只处理没有被 `routes` 匹配到的请求
export const handleRequest = async (request: Request, server) => {
  const upgraded = server.upgrade(request, {
    data: {
      createdAt: Date.now(),
    },
  });

  if (upgraded) return undefined;

  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return res.status(200).json({ ok: true });
  }

  // RPC请求处理
  if (url.pathname.startsWith("/rpc/")) {
    return handleRPCRequest(request);
  }

  // 以下是原有API处理逻辑
  if (url.pathname.startsWith(API_VERSION)) {
    const contentType = request.headers.get("content-type") || "";
    let body;
    if (contentType.includes("application/json") && request.body) {
      try {
        body = await request.json();
        if (!body) body = {};
      } catch (error) {
        logger.warn({ error }, "Failed to parse JSON body");
      }
    }
    let req = {
      url,
      body,
      query: Object.fromEntries(new URLSearchParams(url.search)),
      params: {},
      headers: request.headers,
      method: request.method,
    };

    if (url.pathname.startsWith(API_ENDPOINTS.USERS)) {
      req.user = await handleToken(request, res);
      return authServerRoutes(req, res);
    }

    if (url.pathname.startsWith(API_ENDPOINTS.DATABASE)) {
      return databaseRequest(req, res, url);
    }

    if (url.pathname.startsWith(API_ENDPOINTS.WEATHER)) {
      return weatherRouteHandler(req, res);
    }
  }

  try {
    // 这个函数现在是所有未匹配路由的最终处理器，通常用于渲染前端应用 (SPA)
    return await handleRender(request);
  } catch (error) {
    logger.error({ error }, "Render failed");
    return new Response("<h1>服务器发生错误，请稍后重试</h1>", {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
};
