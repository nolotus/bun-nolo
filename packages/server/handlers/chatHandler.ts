import { getNoloKey } from "ai/llm/getNoloKey";
import { pino } from "pino";
import { verifyToken } from "auth/token";
import serverDb from "database/server/db";

const log = pino({ name: "server:request" });
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};
const errorRes = (msg, code, status = 500, details = "") =>
  new Response(JSON.stringify({ error: { message: msg, details, code } }), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });

const getPublicKey = async (userId) => {
  try {
    const u = await serverDb.get(`user:${userId}`);
    if (!u?.publicKey || u.balance <= 0 || u.isDisabled) {
      log.warn({ userId, u }, "invalid user");
      return {};
    }
    return { publicKey: u.publicKey, isNewUser: true };
  } catch (e) {
    log.error({ userId, e }, "db error");
    return {};
  }
};

const handleToken = async (req) => {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return errorRes("No token provided", "AUTH_NO_TOKEN", 401);

  try {
    const p0 = JSON.parse(atob(token.split(".")[0]));
    const { publicKey, isNewUser } = await getPublicKey(p0.userId);
    if (!publicKey)
      return errorRes("Invalid account", "AUTH_ACCOUNT_INVALID", 401);

    const data = verifyToken(token, publicKey);
    if (!data) return errorRes("Invalid token", "AUTH_INVALID_TOKEN", 401);

    const now = Date.now();
    if (now > new Date(data.exp).getTime())
      return errorRes("Token expired", "AUTH_TOKEN_EXPIRED", 401);
    if (now < new Date(data.nbf).getTime())
      return errorRes("Token not active", "AUTH_TOKEN_NOT_ACTIVE", 401);

    return { ...data, isNewUser };
  } catch (e) {
    log.error({ e }, "token error");
    return errorRes(e.message, "AUTH_VERIFICATION_FAILED", 401);
  }
};

export const handleChatRequest = async (req, extraHeaders = {}) => {
  const user = await handleToken(req);
  if (user instanceof Response) return user;

  try {
    const contentType = req.headers.get("content-type") || "";
    const raw =
      contentType.includes("application/json") && req.body
        ? await req.json().catch(() => ({}))
        : {};
    const { url, KEY, provider, ...body } = raw;
    const apiKey = KEY?.trim() || getNoloKey(provider || "");
    if (!apiKey) throw new Error("Missing API key");

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

    const INIT_TIMEOUT = 60_000; // 等首包
    const IDLE_TIMEOUT = 30_000; // 等后续包

    const ctl = new AbortController();
    const initTimer = setTimeout(() => ctl.abort(), INIT_TIMEOUT);

    const resp = await fetch(url, {
      method: "POST",
      headers: fetchHeaders,
      body: JSON.stringify(body),
      signal: ctl.signal,
    });
    clearTimeout(initTimer);

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Status ${resp.status}: ${txt}`);
    }

    let idleTimer;
    const stream = resp.body.pipeThrough(
      new TransformStream({
        transform(chunk, ctrl) {
          idleTimer && clearTimeout(idleTimer);
          ctrl.enqueue(chunk);
          idleTimer = setTimeout(() => {
            log.warn("stream idle timeout");
            ctrl.error(new Error("Stream idle timeout"));
          }, IDLE_TIMEOUT);
        },
        flush(ctrl) {
          idleTimer && clearTimeout(idleTimer);
        },
      })
    );

    return new Response(stream, {
      headers: {
        ...extraHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    const isAbort = e.name === "AbortError";
    const status = isAbort ? 504 : e.message.includes("Status 400") ? 400 : 500;
    const msg = isAbort ? "Timeout" : e.message;
    return new Response(
      JSON.stringify({ error: { message: msg, code: status } }),
      {
        status,
        headers: { "Content-Type": "application/json", ...extraHeaders },
      }
    );
  }
};
