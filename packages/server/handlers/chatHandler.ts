import { getNoloKey } from "ai/llm/getNoloKey";
import { authenticateRequest } from "auth/utils";

const CORS_HEADERS_PROXY = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const handleChatRequest = async (req: Request, extraHeaders = {}) => {
  const authResult = await authenticateRequest(req);
  if (authResult instanceof Response) {
    return authResult;
  }

  const encoder = new TextEncoder();
  const formatSseError = (message, code) =>
    encoder.encode(`data: ${JSON.stringify({ error: { message, code } })}\n\n`);

  try {
    const body = await req.json();
    const { url, KEY, provider, ...restBody } = body;
    const apiKey = KEY?.trim() || getNoloKey(provider || "");

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Missing API key for upstream",
            code: "MISSING_KEY",
          },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS_PROXY,
          },
        }
      );
    }

    const fetchHeaders = provider?.includes("anthropic")
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
    const initTimer = setTimeout(
      () => controller.abort("Initial request timeout"),
      60_000
    );

    const upstreamResponse = await fetch(url, {
      method: "POST",
      headers: fetchHeaders,
      body: JSON.stringify(restBody),
      signal: controller.signal,
    });
    clearTimeout(initTimer);

    const streamHeaders = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      ...CORS_HEADERS_PROXY,
      ...extraHeaders,
    };

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      const errorMessage = JSON.parse(errorText)?.error?.message || errorText;
      const errorStream = new ReadableStream({
        start(ctrl) {
          ctrl.enqueue(
            formatSseError(errorMessage, `UPSTREAM_${upstreamResponse.status}`)
          );
          ctrl.close();
        },
      });
      return new Response(errorStream, { status: 200, headers: streamHeaders });
    }

    let idleTimer;
    const stream = upstreamResponse.body.pipeThrough(
      new TransformStream({
        transform(chunk, ctrl) {
          clearTimeout(idleTimer);
          ctrl.enqueue(chunk);
          idleTimer = setTimeout(() => {
            ctrl.enqueue(
              formatSseError("Stream idle timeout after 30s", "IDLE_TIMEOUT")
            );
          }, 30_000);
        },
        flush() {
          clearTimeout(idleTimer);
        },
      })
    );

    return new Response(stream, { status: 200, headers: streamHeaders });
  } catch (e: any) {
    const isAbort = e.name === "AbortError";
    const status = isAbort ? 504 : 500;
    const message = isAbort ? e.message : "Proxy request failed";

    return new Response(
      JSON.stringify({ error: { message, code: "PROXY_REQUEST_FAILED" } }),
      {
        status,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS_PROXY },
      }
    );
  }
};
