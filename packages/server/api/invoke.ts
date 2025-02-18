import { pino } from "pino";
import type { ApiError, ApiContext } from "./types";
import { apiMethods, type MethodName } from "./methods";

const logger = pino({
  name: "api:invoke",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
});

export async function invoke<T = unknown>(
  method: MethodName,
  params?: unknown,
  token?: string
): Promise<T> {
  try {
    const apiMethod = apiMethods[method];
    if (!apiMethod) {
      throw {
        code: "not_found",
        message: `Method "${method}" not found`,
      } as ApiError;
    }

    // 认证检查
    if (apiMethod.auth && !token) {
      throw {
        code: "unauthorized",
        message: "Authentication required",
      } as ApiError;
    }

    const context: ApiContext = {
      token,
      // userId 可以从 token 解析获得
    };

    logger.debug(
      {
        method,
        params,
        hasToken: !!token,
      },
      "Invoking API method"
    );

    // 传入 context
    const result = await apiMethod.handler(params, context);

    logger.debug({ method, success: true }, "API method completed");

    return result as T;
  } catch (error) {
    if (!error.code) {
      error = {
        code: "internal",
        message: error.message || "Internal server error",
      } as ApiError;
    }

    logger.error({ error, method, params }, "API invocation failed");
    throw error;
  }
}
