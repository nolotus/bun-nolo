import { API_VERSION,API_ENDPOINTS } from "database/config";
import { handleQuery } from "database/query";
import { handleRender } from "./render";
import { userServerRoute } from 'user/server/route'
let res = {
  status: function (statusCode) {
    return {
      json: function (data) {
        return Response.json(data, { status: statusCode });
      },
    };
  },
};

export const handleRequest = async (requst: Request) => {
  const url = new URL(requst.url);

  // 处理公共资源请求
  if (url.pathname.startsWith("/public")) {
    const file = url.pathname.replace("/public", "");
    return new Response(Bun.file(`public/${file}`));
  }
  if (url.pathname.startsWith(API_VERSION)) {
    let body = await requst.json()
    let query = Object.fromEntries(new URLSearchParams(url.search));  
    let req = {url, body, query, params: {} };  
    if (url.pathname.startsWith(API_ENDPOINTS.USERS)){
      userServerRoute(req,res)
    }
    if (url.pathname.startsWith(API_ENDPOINTS.DATABASE)){
      // 使用split函数获取查询的query  
      if (url.pathname.startsWith("/api/v1/db/query/")) {  
        let userId = url.pathname.split("/api/v1/db/query/")[1];  
        req.params={userId}
      return  handleQuery(req,res)
      } else {    
        return new Response("database");    
      }    
    }

  }
  // 渲染主应用页面
  try {
    return await handleRender(requst);
  } catch (error) {
    console.error(`处理请求时发生错误: ${error}`);
    return new Response("<h1>服务器发生错误，请稍后重试</h1>", {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
};
