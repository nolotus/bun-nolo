import { aiServerRoute } from "ai/server/routes";
import { authServerRoutes } from "auth/server/route";
import { handleToken } from "auth/server/token";
import { API_VERSION, API_ENDPOINTS } from "database/config";
import { databaseRequest } from "database/server/routes";
import { weatherRouteHandler } from "integrations/weather";

import { createResponse } from "./createResponse";
import { handleRender } from "./render";
import { handlePublicRequest } from "./publicRequestHandler"; // 确保路径正确

const res = createResponse();

export const handleRequest = async (request: Request, server) => {
  // const cookies = request.headers.get("Cookie");
  // const token = cookies["X-Token"];
  // const user = await getUserFromToken(token);
  const upgraded = server.upgrade(request, {
    data: {
      createdAt: Date.now(),
      // token: cookies["X-Token"],
      // userId: user.id,
    },
  });

  if (upgraded) return undefined;

  const url = new URL(request.url);
  if (request.method === "OPTIONS") {
    return res.status(200).json({ ok: true });
  }
  if (url.pathname.startsWith("/public")) {
    // 这里确保url是URL类型，如果不是需要先进行转换
    return handlePublicRequest(url);
  }
  if (url.pathname.startsWith("/api/v2/db")) {
    return new Response("Hello v2!");
  }
  if (url.pathname.startsWith(API_VERSION)) {
    if (url.pathname.startsWith(API_ENDPOINTS.HI)) {
      return res.status(200).json({ API_VERSION: API_VERSION });
    }
    const contentType = request.headers.get("content-type") || "";
    let body;

    // 如果是'formdata'类型，则使用formData()方法解析
    if (contentType.includes("multipart/form-data")) {
      try {
        body = await request.formData();
      } catch (error) {
        console.error("Error parsing formdata:", error);
      }
    } else if (contentType.includes("application/json")) {
      // 如果请求体为JSON，尝试解析为JSON对象
      try {
        body = await request.json();
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    }
    let req = {
      url,
      body, // 这里赋值可能是FormData对象或者是JSON对象，视请求而定
      query: Object.fromEntries(new URLSearchParams(url.search)),
      params: {},
      headers: request.headers,
      method: request.method,
    };

    if (url.pathname.startsWith(API_ENDPOINTS.AI)) {
      req.user = await handleToken(request, res);
      return aiServerRoute(req, res);
    }
    if (url.pathname.startsWith(API_ENDPOINTS.USERS)) {
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
    return await handleRender(request);
  } catch (error) {
    console.error(`处理请求时发生错误: ${error}`);
    return new Response("<h1>服务器发生错误，请稍后重试</h1>", {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
};
