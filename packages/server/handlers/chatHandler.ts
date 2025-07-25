import { getNoloKey } from "ai/llm/getNoloKey";
import { authenticateRequest } from "auth/utils";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const formatSseError = (msg: string, code: string) =>
  new TextEncoder().encode(
    `data: ${JSON.stringify({ error: { msg, code } })}\n\n`
  );

export async function handleChatRequest(req: Request, extraHeaders = {}) {
  const auth = await authenticateRequest(req);
  if (auth instanceof Response) return auth;

  try {
    const { url, KEY, provider = "", ...body } = await req.json();
    const apiKey = KEY?.trim() || getNoloKey(provider);
    if (!apiKey)
      return new Response(
        JSON.stringify({
          error: { message: "Missing API key", code: "MISSING_KEY" },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...CORS },
        }
      );

    const headers = provider.includes("anthropic")
      ? {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        }
      : {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        };

    // 全部都用 300s
    const TIMEOUT = 300_000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort("timeout"), TIMEOUT);

    const upstream = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);

    const streamHeaders = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      ...CORS,
      ...extraHeaders,
    };

    if (!upstream.ok) {
      const t = await upstream.text();
      const m = JSON.parse(t)?.error?.message || t;
      return new Response(
        new ReadableStream({
          start(ctrl) {
            ctrl.enqueue(formatSseError(m, `UPSTREAM_${upstream.status}`));
            ctrl.close();
          },
        }),
        { status: 200, headers: streamHeaders }
      );
    }

    let idleTimer: ReturnType<typeof setTimeout>;
    const stream = upstream.body.pipeThrough(
      new TransformStream({
        transform(chunk, ctrl) {
          clearTimeout(idleTimer);
          ctrl.enqueue(chunk);
          idleTimer = setTimeout(() => {
            ctrl.enqueue(formatSseError(`idle ${TIMEOUT / 1000}s`, "IDLE"));
          }, TIMEOUT);
        },
        flush() {
          clearTimeout(idleTimer);
        },
      })
    );

    return new Response(stream, { status: 200, headers: streamHeaders });
  } catch (e: any) {
    const isAbort = e.name === "AbortError";
    return new Response(
      JSON.stringify({
        error: {
          message: isAbort ? e.message : "Proxy failed",
          code: "PROXY_FAILED",
        },
      }),
      {
        status: isAbort ? 504 : 500,
        headers: { "Content-Type": "application/json", ...CORS },
      }
    );
  }
}
