import { omit } from "rambda";
import { getNoloKey } from "ai/llm/getNoloKey";

export const chatRoute = async (req) => {
  try {
    const { body: rawBody } = req;
    const body = omit(["url", "KEY", "provider"], rawBody);
    const apiKey = rawBody.KEY?.trim() || getNoloKey(rawBody.provider);

    if (!apiKey) throw new Error("API key is required but not provided");

    const headers = rawBody.provider?.includes("anthropic")
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
    const timeout = setTimeout(() => {
      console.log("Request timed out after 30 seconds");
      controller.abort();
    }, 30000);

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
    const isAbortError = error.name === "AbortError";
    const isBadRequest = error.message.includes("Status 400");
    const statusCode = isAbortError ? 504 : isBadRequest ? 400 : 500;
    const errorMessage = isAbortError
      ? "Request aborted due to timeout after 30 seconds"
      : error.message;

    return new Response(
      JSON.stringify({ error: errorMessage, code: statusCode }),
      {
        status: statusCode,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
};
