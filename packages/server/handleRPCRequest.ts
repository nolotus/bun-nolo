// server/handleRPCRequest.ts
import { pino } from "pino";
import { invoke } from "./api/invoke";
import { createResponse } from "./createResponse";

const logger = pino({ name: "server:rpc" });
const res = createResponse();

export async function handleRPCRequest(request: Request) {
  const url = new URL(request.url);

  try {
    const methodName = url.pathname.split("/")[2];
    if (!methodName) {
      return res.status(400).json({
        code: "invalid_input",
        message: "Missing method name",
      });
    }

    const params = await parseRequestBody(request);
    const token = request.headers.get("authorization");

    const result = await invoke(methodName, params, token);
    return res.status(200).json(result);
  } catch (error) {
    logger.error({ error, path: url.pathname }, "RPC call failed");
    return res.status(error.code === "unauthorized" ? 401 : 500).json(error);
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
      const body = await request.json();
      return body || {};
    } catch (error) {
      logger.warn({ error }, "Failed to parse JSON body");
      return {};
    }
  }

  return Object.fromEntries(new URL(request.url).searchParams);
}
