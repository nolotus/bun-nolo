import { omit } from "rambda";

export const proxyRoute = async (req, res) => {
  try {
    const rawBody = req.body;
    const body = omit("url,KEY", rawBody);

    // 预定义headers
    const headers = rawBody.model.includes("claude")
      ? {
          "Content-Type": "application/json",
          "x-api-key": rawBody.KEY,
          "anthropic-version": "2023-06-01",
        }
      : {
          "Content-Type": "application/json",
          Authorization: `Bearer ${rawBody.KEY}`,
        };

    // 设置超时控制
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    // 创建转换流
    const { readable, writable } = new TransformStream();

    // 发起fetch请求
    fetch(rawBody.url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // 通过管道传输响应
        response.body.pipeTo(writable).catch((error) => {
          console.error("Stream error:", error);
          writable.abort(error);
        });
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        writable.abort(error);
      })
      .finally(() => {
        clearTimeout(timeout);
      });

    // 返回流式响应
    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};
