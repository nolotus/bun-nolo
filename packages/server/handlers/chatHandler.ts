// /path/to/your/chatHandler.ts

import { getNoloKey } from "ai/llm/getNoloKey";
import { authenticateRequest } from "auth/utils";

// --- 优化点 1: 使用常量替代魔法数字，提高可维护性 ---
// 默认超时时间 (毫秒)
const INITIAL_REQUEST_TIMEOUT_MS = 120 * 1000; // 增加初始请求超时时间为120秒
const DEFAULT_STREAM_IDLE_TIMEOUT_MS = 120 * 1000; // 默认2分钟流空闲超时

// API 相关常量
const ANTHROPIC_VERSION = "2023-06-01";

// CORS 头
const CORS_HEADERS_PROXY = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * 格式化 SSE 错误消息
 * @param message 错误信息
 * @param code 错误码
 * @returns Uint8Array 格式的错误数据
 */
const formatSseError = (message: string, code: string): Uint8Array => {
  const encoder = new TextEncoder();
  return encoder.encode(
    `data: ${JSON.stringify({ error: { message, code } })}\n\n`
  );
};

export const handleChatRequest = async (req: Request, extraHeaders = {}) => {
  console.log("Starting request handling...");

  const authResult = await authenticateRequest(req);
  if (authResult instanceof Response) {
    console.log("Authentication failed, returning response...");
    return authResult;
  }

  try {
    const body = await req.json();
    // --- 优化点 2: 从请求体中解构出 streamIdleTimeout ---
    const { url, KEY, provider, streamIdleTimeout, ...restBody } = body;
    console.log("restBody:", restBody); // 打印 restBody 的内容
    const apiKey = KEY?.trim() || getNoloKey(provider || "");
    console.log("Using API Key:", apiKey);

    if (!apiKey) {
      console.log("Missing API key for upstream");
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

    const baseHeaders = { "Content-Type": "application/json" };
    const fetchHeaders = provider?.includes("anthropic")
      ? {
          ...baseHeaders,
          "x-api-key": apiKey,
          "anthropic-version": ANTHROPIC_VERSION,
        }
      : {
          ...baseHeaders,
          Authorization: `Bearer ${apiKey}`,
        };

    console.log("Request headers:", fetchHeaders);

    const controller = new AbortController();
    const initTimer = setTimeout(
      () => controller.abort("Initial request timeout"),
      INITIAL_REQUEST_TIMEOUT_MS
    );

    console.log("Sending request to upstream:", url);
    const upstreamResponse = await fetch(url, {
      method: "POST",
      headers: fetchHeaders,
      body: JSON.stringify(restBody),
      signal: controller.signal,
    });
    clearTimeout(initTimer);

    console.log("Upstream response status:", upstreamResponse.status);

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
      console.log("Upstream request failed with error:", errorMessage);
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

    // --- 优化点 3: 使用客户端指定的超时或默认值 ---
    const idleTimeout = streamIdleTimeout || DEFAULT_STREAM_IDLE_TIMEOUT_MS;
    let idleTimer: ReturnType<typeof setTimeout>;

    const stream = upstreamResponse.body.pipeThrough(
      new TransformStream({
        transform(chunk, ctrl) {
          clearTimeout(idleTimer);
          ctrl.enqueue(chunk);
          idleTimer = setTimeout(() => {
            // --- 优化点 4: 动态错误信息 ---
            const errorMessage = `Stream idle timeout after ${idleTimeout / 1000}s`;
            console.log("Stream idle timeout:", errorMessage);
            ctrl.enqueue(formatSseError(errorMessage, "IDLE_TIMEOUT"));
            // 可以在此处选择性地关闭流
            // ctrl.terminate();
          }, idleTimeout);
        },
        flush() {
          clearTimeout(idleTimer);
        },
      })
    );

    console.log("Returning stream response...");
    return new Response(stream, { status: 200, headers: streamHeaders });
  } catch (e: any) {
    console.error("Error occurred:", e);
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
