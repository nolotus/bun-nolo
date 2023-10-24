import { API_VERSION, API_ENDPOINTS } from "database/config";
import { handleQuery } from "database/query";
import { handleWrite } from "database/server/write";
import { userServerRoute } from "user/server/route";
import { handleToken } from "auth/server/token";
import { postToOpenAIProxy } from "ai/server/openai";
import { handleRender } from "./render";
import { createResponse } from "./createResponse";

let res = createResponse();

export const handleRequest = async (request: Request) => {
  const url = new URL(request.url);

  if (url.pathname.startsWith("/public")) {
    const file = url.pathname.replace("/public", "");
    return new Response(Bun.file(`public/${file}`));
  }
  if (url.pathname.startsWith(API_VERSION)) {
    let body = await request.json();
    let query = Object.fromEntries(new URLSearchParams(url.search));
    let req = { url, body, query, params: {} };
    if (url.pathname.startsWith(`${API_VERSION}/openai-proxy`)) {
      req.user = await handleToken(request, res);
      return postToOpenAIProxy(req, res);
    }
    if (url.pathname.startsWith(API_ENDPOINTS.USERS)) {
      return userServerRoute(req, res);
    }
    if (url.pathname.startsWith(API_ENDPOINTS.DATABASE)) {
      if (url.pathname.startsWith("/api/v1/db/write")) {
        req.user = await handleToken(request, res);
        return handleWrite(req, res);
      }

      // 使用split函数获取查询的query
      if (url.pathname.startsWith("/api/v1/db/query/")) {
        let userId = url.pathname.split("/api/v1/db/query/")[1];
        req.params = { userId };
        return handleQuery(req, res);
      } else {
        return new Response("database");
      }
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
