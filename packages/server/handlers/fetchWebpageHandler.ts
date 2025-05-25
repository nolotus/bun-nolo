// 文件路径: handlers/fetchWebpageHandler.ts
export const handleFetchWebpage = async (req: Request): Promise<Response> => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return new Response(JSON.stringify({ error: "URL 参数是必需的" }), {
        status: 400,
        headers,
      });
    }

    const response = await fetch(url);
    const content = await response.text();

    // 清理 HTML 内容
    const cleanedContent = cleanHtmlForAI(content);
    // 设置预览长度和完整内容长度限制
    const previewLength = 2000; // 预览长度：2000 字符
    const maxContentLength = 50 * 1024; // 完整内容限制：50KB
    const previewContent =
      cleanedContent.length > previewLength
        ? cleanedContent.substring(0, previewLength) + "...（预览内容已截断）"
        : cleanedContent;
    const fullContent =
      cleanedContent.length > maxContentLength
        ? cleanedContent.substring(0, maxContentLength) +
          "...（完整内容已截断）"
        : cleanedContent;

    return new Response(
      JSON.stringify({
        preview: previewContent,
        fullContent: fullContent,
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers,
    });
  }
};

// 伪代码：清理 HTML 内容
function cleanHtmlForAI(html: string): string {
  // 去除 script, style 等标签
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
