// 文件路径: handlers/fetchWebpageHandler.ts

// 处理网页访问请求的函数
export const handleFetchWebpage = async (req: Request): Promise<Response> => {
  // 设置 CORS 头，允许所有来源
  const headers = {
    "Access-Control-Allow-Origin": "*", // 允许所有域名访问
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400", // 缓存 24 小时
    "Content-Type": "application/json",
  };

  // 处理 OPTIONS 请求（预检请求）
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    // 解析请求体中的 URL
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return new Response(JSON.stringify({ error: "URL 参数是必需的" }), {
        status: 400,
        headers,
      });
    }

    // 使用 fetch 获取网页内容
    const response = await fetch(url);
    const content = await response.text();

    // 设置内容大小限制（例如前 100KB）
    const maxContentLength = 100 * 1024; // 100KB
    const truncatedContent =
      content.length > maxContentLength
        ? content.substring(0, maxContentLength) + "...（内容已截断）"
        : content;

    // 返回网页内容
    return new Response(JSON.stringify({ content: truncatedContent }), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers,
    });
  }
};
