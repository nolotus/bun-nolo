// server/handleRequest.ts
// 说明：作为 Bun 的兜底 fetch 处理器，负责：
// 1）WebSocket 升级
// 2）RPC 请求转发 (/rpc/*)
// 3）以 API_VERSION 为前缀的后端 API（用户、数据库、天气等）
// 4）其余请求交给前端渲染（handleRender）

import type { Server } from "bun";
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

const RPC_PREFIX = "/rpc/";

// -----------------------------
// 辅助方法
// -----------------------------

/**
 * 判断请求是否为 JSON 请求
 */
const isJsonRequest = (request: Request): boolean => {
  const contentType = request.headers.get("content-type") || "";
  return contentType.includes("application/json");
};

/**
 * 尝试解析 JSON 请求体，失败时记录日志但不中断流程
 */
const parseJsonBody = async (request: Request) => {
  if (!isJsonRequest(request) || !request.body) return {};

  try {
    const body = await request.json();
    return body || {};
  } catch (error) {
    logger.warn({ error }, "Failed to parse JSON body");
    return {};
  }
};

/**
 * 从 Bun Server 获取 IP 信息
 */
const getIpInfo = (request: Request, server: Server) => {
  if (typeof server.requestIP !== "function") {
    return { ipFromServer: null, ipInfo: null };
  }

  const ipInfo = server.requestIP(request);
  const ipFromServer = ipInfo?.address || null;

  return { ipFromServer, ipInfo };
};

/**
 * 组装下游使用的 req 对象（简化版 Express Request）
 */
const buildDownstreamRequest = async (
  request: Request,
  server: Server,
  url: URL
) => {
  const body = await parseJsonBody(request);
  const { ipFromServer, ipInfo } = getIpInfo(request, server);

  const req: any = {
    url, // URL 实例
    body,
    query: Object.fromEntries(new URLSearchParams(url.search)),
    params: {},
    headers: request.headers,
    method: request.method,
    ip: ipFromServer,
    ipDebug: { ipFromServer, ipInfo },
  };

  return req;
};

/**
 * 处理以 API_VERSION 开头的后端 API 请求
 * 匹配不到具体子路由时返回 undefined，让上层去走渲染逻辑
 */
const handleVersionedApiRequest = async (
  request: Request,
  server: Server,
  url: URL
): Promise<Response | undefined> => {
  if (!url.pathname.startsWith(API_VERSION)) {
    return undefined;
  }

  const req = await buildDownstreamRequest(request, server, url);

  // 用户相关路由
  if (url.pathname.startsWith(API_ENDPOINTS.USERS)) {
    req.user = await handleToken(request, res);
    return authServerRoutes(req, res);
  }

  // 数据库相关路由
  if (url.pathname.startsWith(API_ENDPOINTS.DATABASE)) {
    return databaseRequest(req, res, url);
  }

  // 天气服务
  if (url.pathname.startsWith(API_ENDPOINTS.WEATHER)) {
    return weatherRouteHandler(req, res);
  }

  // 未匹配到具体子路由：交给上层继续处理（通常是前端渲染）
  return undefined;
};

// -----------------------------
// 主处理函数
// -----------------------------

// 注意：这个函数现在只处理没有被 `routes` 匹配到的请求
export const handleRequest = async (request: Request, server: Server) => {
  // 1. WebSocket 升级（Bun 特性）
  const upgraded = server.upgrade(request, {
    data: { createdAt: Date.now() },
  });
  if (upgraded) return undefined;

  const url = new URL(request.url);

  // 2. 统一处理 OPTIONS 预检请求
  if (request.method === "OPTIONS") {
    return res.status(200).json({ ok: true });
  }

  // 3. RPC 请求处理（/rpc/*）
  if (url.pathname.startsWith(RPC_PREFIX)) {
    return handleRPCRequest(request);
  }

  // 4. 后端 API（以 API_VERSION 为前缀）
  const apiResponse = await handleVersionedApiRequest(request, server, url);
  if (apiResponse) {
    return apiResponse;
  }

  // 5. 兜底：渲染前端应用
  try {
    return await handleRender(request);
  } catch (error) {
    logger.error({ error }, "Render failed");
    return new Response("<h1>服务器发生错误，请稍后重试</h1>", {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
};
