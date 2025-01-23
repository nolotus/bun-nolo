import { omit } from "rambda";
import { getNoloKey } from "ai/llm/getNoloKey";

export const proxyRoute = async (req, res) => {
  try {
    const rawBody = req.body;
    const body = omit("url,KEY,provider", rawBody);
    let apiKey;
    const userKey = rawBody.KEY?.trim();

    apiKey = Boolean(userKey) ? userKey : getNoloKey(rawBody.provider);
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

    const response = await fetch(rawBody.url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Status ${response.status}: ${errorText}`);
    }

    clearTimeout(timeout);

    return new Response(response.body, {
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
