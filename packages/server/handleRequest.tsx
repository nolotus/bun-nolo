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

/**
 * 从标准代理头中尽可能提取真实客户端 IP
 * 优先级：cf-connecting-ip > x-real-ip > x-forwarded-for(首个) > forwarded
 * 不信任客户端 body.clientIp，仅作参考
 */
function extractClientIp(headers: Headers): string | null {
  try {
    const cf = headers.get("cf-connecting-ip");
    if (cf && cf !== "unknown") return cf.trim();

    const real = headers.get("x-real-ip");
    if (real && real !== "unknown") return real.trim();

    const xff = headers.get("x-forwarded-for");
    if (xff) {
      const first = xff.split(",")[0]?.trim();
      if (first && first !== "unknown") return first;
    }

    const forwarded = headers.get("forwarded"); // e.g. for=1.2.3.4;proto=https;by=...
    if (forwarded) {
      const m = forwarded.match(/for="?([^;"]+)"?/i);
      if (m?.[1] && m[1] !== "unknown") return m[1].trim();
    }
  } catch {}
  return null;
}

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
    let body: any;
    if (contentType.includes("application/json") && request.body) {
      try {
        body = await request.json();
        if (!body) body = {};
      } catch (error) {
        logger.warn({ error }, "Failed to parse JSON body");
      }
    }

    // 新增：提取真实来源 IP（来自代理头）
    const clientIp = extractClientIp(request.headers);

    // 可选：记录客户端上报的 IP（仅作参考，不参与风控判定）
    const reportedClientIp =
      (body && body.clientIp) || request.headers.get("x-client-ip") || null;

    // 统一封装给下游的 req 对象
    const req: any = {
      url, // URL 实例
      body: body || {},
      query: Object.fromEntries(new URLSearchParams(url.search)),
      params: {},
      headers: request.headers,
      method: request.method,

      // 新增字段：真实 IP 与上报 IP
      ip: clientIp, // 真实来源 IP（从代理头解析）
      reportedClientIp, // 客户端上报 IP（仅日志参考）
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
