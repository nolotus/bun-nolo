// chatService.ts (后端)

import { getNoloKey } from "ai/llm/getNoloKey";
import { pino } from "pino";
import { verifyToken } from "auth/token";
import serverDb from "database/server/db";

const log = pino({ name: "server:request" });
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const jsonErrorResponse = (message, code, status = 500) =>
  new Response(JSON.stringify({ error: { message, code } }), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });

const getPublicKey = async (userId) => {
  try {
    const user = await serverDb.get(`user:${userId}`);
    if (user?.publicKey && user.balance > 0 && !user.isDisabled) {
      return user.publicKey;
    }
    log.warn({ userId, user }, "Invalid user for public key retrieval");
    return null;
  } catch (e) {
    log.error({ userId, e }, "DB error getting public key");
    return null;
  }
};

const handleToken = async (req) => {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token)
    return jsonErrorResponse("No token provided", "AUTH_NO_TOKEN", 401);

  try {
    const payload = JSON.parse(atob(token.split(".")[0]));
    const publicKey = await getPublicKey(payload.userId);
    if (!publicKey)
      return jsonErrorResponse("Invalid account", "AUTH_ACCOUNT_INVALID", 401);

    const data = verifyToken(token, publicKey);
    if (!data)
      return jsonErrorResponse("Invalid token", "AUTH_INVALID_TOKEN", 401);

    const now = Date.now();
    if (now > new Date(data.exp).getTime())
      return jsonErrorResponse("Token expired", "AUTH_TOKEN_EXPIRED", 401);
    if (now < new Date(data.nbf).getTime())
      return jsonErrorResponse(
        "Token not active",
        "AUTH_TOKEN_NOT_ACTIVE",
        401
      );

    return data;
  } catch (e) {
    log.error({ error: e }, "Token verification failed");
    return jsonErrorResponse(e.message, "AUTH_VERIFICATION_FAILED", 401);
  }
};

export const handleChatRequest = async (req, extraHeaders = {}) => {
  const user = await handleToken(req);
  if (user instanceof Response) return user;

  const encoder = new TextEncoder();
  const formatSseError = (message, code) =>
    encoder.encode(`data: ${JSON.stringify({ error: { message, code } })}\n\n`);

  try {
    const body = await req.json();
    const { url, KEY, provider, ...restBody } = body;
    const apiKey = KEY?.trim() || getNoloKey(provider || "");

    if (!apiKey)
      return jsonErrorResponse(
        "Missing API key for upstream",
        "MISSING_KEY",
        400
      );

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

    const INIT_TIMEOUT = 60_000;
    const IDLE_TIMEOUT = 30_000;

    const controller = new AbortController();
    const initTimer = setTimeout(
      () => controller.abort("Initial request timeout"),
      INIT_TIMEOUT
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
      ...CORS_HEADERS,
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
            log.warn("Stream idle timeout");
            ctrl.enqueue(
              formatSseError("Stream idle timeout after 30s", "IDLE_TIMEOUT")
            );
          }, IDLE_TIMEOUT);
        },
        flush() {
          clearTimeout(idleTimer);
        },
      })
    );

    return new Response(stream, { status: 200, headers: streamHeaders });
  } catch (e) {
    log.error({ error: e }, "handleChatRequest failed");
    const isAbort = e.name === "AbortError";
    const status = isAbort ? 504 : 500;
    const message = isAbort ? e.message : "Proxy request failed";
    return jsonErrorResponse(message, "PROXY_REQUEST_FAILED", status);
  }
};
