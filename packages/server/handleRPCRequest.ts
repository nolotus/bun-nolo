// server/handleRPCRequest.ts

import { pino } from "pino";
import { createResponse } from "./createResponse";
import { apiMethods } from "./api/methods";
import type { MethodName } from "./api/methods";
import type { ApiContext, ApiError } from "./api/types";

const logger = pino({ name: "server:rpc" });
const res = createResponse();

async function invoke<T = unknown>(
  method: MethodName,
  params?: unknown,
  token?: string
): Promise<T> {
  const apiMethod = apiMethods[method];
  if (!apiMethod) {
    throw {
      code: "not_found",
      message: `Method "${method}" not found`,
    } as ApiError;
  }
  if (apiMethod.auth && !token) {
    throw {
      code: "unauthorized",
      message: "Authentication required",
    } as ApiError;
  }

  const context: ApiContext = { token };

  try {
    const result = await apiMethod.handler(params, context);
    return result as T;
  } catch (err: any) {
    if (!err.code) {
      err = {
        code: "internal",
        message: err.message || "Internal server error",
      } as ApiError;
    }
    throw err as ApiError;
  }
}

export async function handleRPCRequest(request: Request) {
  const url = new URL(request.url);

  try {
    const methodName = url.pathname.split("/")[2] as MethodName;
    if (!methodName) {
      return res.status(400).json({
        code: "invalid_input",
        message: "Missing method name",
      });
    }

    const params = await parseRequestBody(request);
    const token = request.headers.get("authorization") || undefined;

    const result = await invoke(methodName, params, token);
    return res.status(200).json(result);
  } catch (error: any) {
    logger.error({ error, path: url.pathname }, "RPC call failed");
    const status = error.code === "unauthorized" ? 401 : 500;
    return res.status(status).json(error);
  }
}

async function parseRequestBody(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    try {
      return await request.formData();
    } catch (error) {
      logger.warn({ error }, "Failed to parse form data");
      return {};
    }
  }

  if (contentType.includes("application/json") && request.body) {
    try {
      return (await request.json()) || {};
    } catch (error) {
      logger.warn({ error }, "Failed to parse JSON body");
      return {};
    }
  }

  return Object.fromEntries(new URL(request.url).searchParams);
}
