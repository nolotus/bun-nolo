import { omit } from "rambda";

export const proxyRoute = async (req, res) => {
  try {
    const rawBody = req.body;
    const body = omit("url,KEY", rawBody);
    let apiKey;
    const userKey = rawBody.KEY?.trim(); // 添加trim()去除可能的空格

    const getNoloKey = (model) => {
      if (model?.includes("codestral")) {
        return process.env.MISTRAL_KEY;
      }
      return null;
    };

    apiKey = Boolean(userKey) ? userKey : getNoloKey(rawBody.model);

    if (!apiKey) {
      throw new Error("API key is required but not provided");
    }

    const headers = rawBody.model?.includes("claude")
      ? {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        }
      : {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const { readable, writable } = new TransformStream();

    fetch(rawBody.url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Status ${response.status}: ${errorText}`);
        }
        return response.body.pipeTo(writable);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        writable.abort(error);
        return new Response(
          JSON.stringify({
            error: error.message,
            code: error.message.includes("Status 400") ? 400 : 500,
          }),
          {
            status: error.message.includes("Status 400") ? 400 : 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      })
      .finally(() => {
        clearTimeout(timeout);
      });

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
    return new Response(
      JSON.stringify({
        error: error.message,
        code: error.message.includes("Status 400") ? 400 : 500,
      }),
      {
        status: error.message.includes("Status 400") ? 400 : 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
};
