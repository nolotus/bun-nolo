
import { handleRender } from "./render";
export const handleRequest = async (req) => {
    const url = new URL(req.url);
  
    // 处理公共资源请求
    if (url.pathname.startsWith("/public")) {
      const file = url.pathname.replace("/public", "");
      return new Response(Bun.file(`public/${file}`));
    }
  
    // 渲染主应用页面
    try {
      return await handleRender(req);
    } catch (error) {
      console.error(`处理请求时发生错误: ${error}`);
      return new Response("<h1>服务器发生错误，请稍后重试</h1>", {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  };