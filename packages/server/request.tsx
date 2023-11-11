import { aiServerRoute } from 'ai/server/routes';
import { handleToken } from 'auth/server/token';
import { API_VERSION, API_ENDPOINTS } from 'database/config';
import { DatabaseRequest } from 'database/server/routes';
import { userServerRoute } from 'user/server/route';

import { createResponse } from './createResponse';
import { handleRender } from './render';

let res = createResponse();

export const handleRequest = async (
  request: Request,
  assets: { js: string, css: string },
) => {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') {
    return res.status(200).json('ok');
  }
  if (url.pathname.startsWith('/public')) {
    const filePath = url.pathname.replace('/public', '');
    const file = Bun.file(`public${filePath}`);

    let cacheControlHeader = 'no-cache, no-store, must-revalidate'; // 默认为开发环境设置
    if (process.env.NODE_ENV === 'production') {
      // 在生产环境中设置更长的缓存时间
      cacheControlHeader = 'public, max-age=86400'; // 例如, 1年
    }

    return new Response(file, {
      headers: {
        'Cache-Control': cacheControlHeader,
        'Content-Type': file.type,
      },
    });
  }
  if (url.pathname.startsWith(API_VERSION)) {
    let body = request.body ? await request.json() : null;
    let query = Object.fromEntries(new URLSearchParams(url.search));
    let req = {
      url,
      body,
      query,
      params: {},
      headers: request.headers,
      method: request.method,
    };

    if (url.pathname.startsWith(API_ENDPOINTS.AI)) {
      req.user = await handleToken(request, res);
      return aiServerRoute(req, res);
    }
    if (url.pathname.startsWith(API_ENDPOINTS.USERS)) {
      return userServerRoute(req, res);
    }

    if (url.pathname.startsWith(API_ENDPOINTS.DATABASE)) {
      return DatabaseRequest(req, res, url);
    }
  }
  try {
    return await handleRender(request, assets);
  } catch (error) {
    console.error(`处理请求时发生错误: ${error}`);
    return new Response('<h1>服务器发生错误，请稍后重试</h1>', {
      status: 500,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }
};
