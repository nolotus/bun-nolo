import { omit } from "rambda";
import { getNoloKey } from "ai/llm/getNoloKey";
import { pino } from "pino";
import { verifyToken } from "auth/token";
import serverDb from "database/server/db";

const logger = pino({ name: "server:request" });

// 辅助函数：处理错误响应
// 辅助函数：处理错误响应
const handleErrorResponse = (
  error,
  status = 500,
  details = "",
  errorCode = ""
) => {
  logger.error({ error, status, details }, "Returning error response");
  return new Response(
    JSON.stringify({
      error: {
        message: error.message,
        details: details || "No additional details available",
        code: errorCode || `E${status}`, // 添加错误代码，用于前端区分
      },
    }),
    {
      status: status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // 添加 CORS 头
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    }
  );
};

// Token 验证逻辑
const handleToken = async (req) => {
  logger.info("Starting token validation process");
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    logger.warn("No token provided in request");
    return handleErrorResponse(
      new Error("Access denied. No token provided."),
      401,
      "",
      "AUTH_NO_TOKEN"
    );
  }

  try {
    const [payloadBase64Url] = token.split(".");
    const tempPayload = JSON.parse(atob(payloadBase64Url));
    logger.info(
      { userId: tempPayload.userId },
      "Extracted userId from token payload"
    );

    const { publicKey, isNewUser } = await getPublicKey(tempPayload.userId);
    if (!publicKey) {
      logger.warn(
        { userId: tempPayload.userId },
        "Public key not found for user"
      );
      return handleErrorResponse(
        new Error("Public key not found or account invalid"),
        401,
        "",
        "AUTH_ACCOUNT_INVALID"
      );
    }

    const payload = verifyToken(token, publicKey);
    if (!payload) {
      logger.warn(
        { userId: tempPayload.userId },
        "Token verification failed: invalid token"
      );
      return handleErrorResponse(
        new Error("Invalid token"),
        401,
        "",
        "AUTH_INVALID_TOKEN"
      );
    }

    const currentTime = new Date().getTime();
    const expTime = new Date(payload.exp).getTime();
    if (currentTime > expTime) {
      logger.warn({ userId: tempPayload.userId }, "Token has expired");
      return handleErrorResponse(
        new Error("Token has expired"),
        401,
        "",
        "AUTH_TOKEN_EXPIRED"
      );
    }

    const nbfTime = new Date(payload.nbf).getTime();
    if (currentTime < nbfTime) {
      logger.warn({ userId: tempPayload.userId }, "Token not yet active");
      return handleErrorResponse(
        new Error("Token not yet active"),
        401,
        "",
        "AUTH_TOKEN_NOT_ACTIVE"
      );
    }

    logger.info({ userId: tempPayload.userId }, "Token validation successful");
    return {
      ...payload,
      isNewUser,
    };
  } catch (err) {
    logger.error({ err }, "Token verification process failed with error");
    return handleErrorResponse(err, 401, "", "AUTH_VERIFICATION_FAILED");
  }
};
// 辅助函数：获取用户公钥
const getPublicKey = async (userId) => {
  logger.info({ userId }, "Attempting to get public key for user");
  try {
    const newUser = await serverDb.get(`user:${userId}`);
    if (newUser) {
      logger.info({ userId }, "User data retrieved from database");
      if (newUser.publicKey) {
        // 检查 balance 是否小于等于 0
        if (newUser.balance <= 0) {
          logger.warn(
            { userId, balance: newUser.balance },
            "User balance is insufficient"
          );
          return {};
        }
        // 检查 isDisabled 是否为 true
        if (newUser.isDisabled === true) {
          logger.warn({ userId }, "User account is disabled");
          return {};
        }
        logger.info({ userId }, "Public key found and user account is valid");
        return {
          publicKey: newUser.publicKey,
          isNewUser: true,
        };
      } else {
        logger.warn({ userId }, "No public key found for user");
      }
    } else {
      logger.warn({ userId }, "User not found in database");
    }
  } catch (err) {
    logger.error({ err, userId }, "Failed to get public key from database");
  }
  logger.info({ userId }, "Returning empty result as no valid user data found");
  return {};
};

// 聊天请求处理函数
export const handleChatRequest = async (req, headers = {}) => {
  logger.info("Starting chat request handling");
  const userResult = await handleToken(req);

  if (userResult instanceof Response) {
    logger.warn("Token validation failed, returning error response");
    return userResult;
  }

  logger.info(
    { userId: userResult.userId },
    "User authenticated successfully for chat request"
  );

  try {
    const contentType = req.headers.get("content-type") || "";
    let rawBody = {};

    if (contentType.includes("application/json") && req.body) {
      try {
        rawBody = await req.json();
        if (!rawBody) {
          logger.warn("Parsed JSON body is empty, setting to empty object");
          rawBody = {};
        }
      } catch (error) {
        logger.error({ error }, "Failed to parse JSON body");
        return handleErrorResponse(new Error("Invalid JSON body"), 400);
      }
    } else {
      logger.warn(
        { contentType },
        "Content type is not JSON or no body provided"
      );
    }

    const body = omit(["url", "KEY", "provider"], rawBody);
    const apiKey = rawBody.KEY?.trim() || getNoloKey(rawBody.provider);

    if (!apiKey) {
      logger.error("API key is required but not provided");
      throw new Error("API key is required but not provided");
    }

    const fetchHeaders = rawBody.provider?.includes("anthropic")
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
      logger.warn("Request timed out after 30 seconds, aborting");
      controller.abort();
    }, 30000);

    const response = await fetch(rawBody.url, {
      method: "POST",
      headers: fetchHeaders,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      logger.error(
        { status: response.status },
        "Proxy request failed with error status"
      );
      const errorText = await response.text();
      logger.error({ errorText }, "Error details from proxy response");
      throw new Error(`Status ${response.status}: ${errorText}`);
    }

    logger.info("Proxy request successful");
    clearTimeout(timeout);

    return new Response(response.body, {
      headers: {
        ...headers,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    logger.error({ error }, "Chat request proxy error occurred");
    const isAbortError = error.name === "AbortError";
    const isBadRequest = error.message.includes("Status 400");
    const statusCode = isAbortError ? 504 : isBadRequest ? 400 : 500;
    const errorMessage = isAbortError
      ? "Request aborted due to timeout after 30 seconds"
      : error.message;

    logger.info(
      { statusCode, errorMessage },
      "Returning error response for chat request"
    );
    return new Response(
      JSON.stringify({
        error: {
          message: errorMessage,
          code: statusCode,
        },
      }),
      {
        status: statusCode,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      }
    );
  }
};
