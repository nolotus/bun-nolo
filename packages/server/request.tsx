import { aiServerRoute } from 'ai/server/routes';
import { handleToken } from 'auth/server/token';
import { API_VERSION, API_ENDPOINTS } from 'database/config';
import { DatabaseRequest } from 'database/server/routes';
import {  authServerRoutes } from 'auth/server/route';

import { createResponse } from './createResponse';
import { handleRender } from './render';

let res = createResponse();

export const handleRequest = async (request: Request) => {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') {
    return res.status(200).json({ok:true});
  }
  if (url.pathname.startsWith('/public')) {
    const filePath = url.pathname.replace('/public', '');
    const file = Bun.file(`public${filePath}`);
    const headers = new Headers({
      'Cache-Control': 'max-age=3600',
      type: file.type,
    });
    return new Response(file.stream(), { headers });
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
      console.log('auth')
      return authServerRoutes(req, res);
    }

    if (url.pathname.startsWith(API_ENDPOINTS.DATABASE)) {
      return DatabaseRequest(req, res, url);
    }
  }
  try {
    return await handleRender(request);
  } catch (error) {
    console.error(`处理请求时发生错误: ${error}`);
    return new Response('<h1>服务器发生错误，请稍后重试</h1>', {
      status: 500,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }
};
