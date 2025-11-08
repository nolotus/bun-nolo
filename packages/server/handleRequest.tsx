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
export const handleRequest = async (request: Request, server: any) => {
  const upgraded = server.upgrade(request, {
    data: { createdAt: Date.now() },
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
    let body: any;
    if (contentType.includes("application/json") && request.body) {
      try {
        body = await request.json();
        if (!body) body = {};
      } catch (error) {
        logger.warn({ error }, "Failed to parse JSON body");
      }
    }

    // 仅使用 Bun 提供的 IP
    const ipInfo =
      typeof server.requestIP === "function" ? server.requestIP(request) : null;
    const ipFromServer = ipInfo?.address || null;

    // 下游 req 对象（仅注入必要字段）
    const req: any = {
      url, // URL 实例
      body: body || {},
      query: Object.fromEntries(new URLSearchParams(url.search)),
      params: {},
      headers: request.headers,
      method: request.method,

      // 只注入 ip（来自 Bun）
      ip: ipFromServer,
      // 可选：给下游做更详细的调试
      ipDebug: { ipFromServer, ipInfo },
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
    // 未匹配路由：渲染前端应用
    return await handleRender(request);
  } catch (error) {
    logger.error({ error }, "Render failed");
    return new Response("<h1>服务器发生错误，请稍后重试</h1>", {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
};
