// auth/server/shared.ts
import { nolotusId } from "core/init";
import pino from "pino";

export const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
      messageFormat: "{msg}",
      levelFirst: true,
    },
  },
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
});

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

export function createErrorResponse(error: string, status: number = 500) {
  logger.error({ error, status }, "Error response created");

  return new Response(JSON.stringify({ error }), {
    status,
    headers: CORS_HEADERS,
  });
}

export function createSuccessResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

export function handleOptionsRequest() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export function checkAdminPermission(req: Request) {
  if (!req.user?.userId || req.user.userId !== nolotusId) {
    return createErrorResponse("Unauthorized: Admin access required", 403);
  }
  return null;
}
