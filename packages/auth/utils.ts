// auth/utils.ts (新的文件路径)
// 导入依赖，这些应该在您的项目中是可用的
import { pino } from "pino"; // 假设您已经安装了 pino
import { verifyToken } from "auth/token"; // 您的 JWT 验证函数
import serverDb from "database/server/db"; // 您的 KV 数据库实例，用于获取 publicKey

const log = pino({ name: "auth:middleware" });

// 定义 CORS 头部，作为全局常量，方便统一管理
export const CORS_HEADERS_AUTH = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

// 统一的错误响应生成器
export const authErrorResponse = (
  msg: string,
  code: string,
  status: number = 500,
  details: string = ""
): Response =>
  new Response(JSON.stringify({ error: { message: msg, details, code } }), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS_AUTH },
  });

// 获取用户的公钥和状态（从您的 KV 数据库）
const getPublicKey = async (userId: string) => {
  try {
    const u = await serverDb.get(`user:${userId}`);
    if (!u?.publicKey || u.balance <= 0 || u.isDisabled) {
      log.warn(
        { userId, userDetails: u },
        "Invalid user or insufficient balance/disabled."
      );
      return { publicKey: null, isValid: false };
    }
    return { publicKey: u.publicKey, isValid: true };
  } catch (e) {
    log.error(
      { userId, error: e },
      "Database error during public key retrieval."
    );
    return { publicKey: null, isValid: false };
  }
};

/**
 * 处理请求中的 Authorization token，并验证用户身份。
 * @param req Bun Request 对象。
 * @returns {Promise<{ userId: string, isNewUser?: boolean } | Response>} 返回用户数据对象或一个错误 Response。
 */
export const authenticateRequest = async (
  req: Request
): Promise<{ userId: string; isNewUser?: boolean } | Response> => {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token)
    return authErrorResponse(
      "No authentication token provided.",
      "AUTH_NO_TOKEN",
      401
    );

  try {
    const tokenHeaderPayload = JSON.parse(atob(token.split(".")[0]));
    const userIdFromTokenHeader = tokenHeaderPayload.userId;

    if (!userIdFromTokenHeader) {
      return authErrorResponse(
        "Invalid token format: Missing user ID in header.",
        "AUTH_INVALID_TOKEN",
        401
      );
    }

    const { publicKey, isValid } = await getPublicKey(userIdFromTokenHeader);
    if (!isValid || !publicKey) {
      return authErrorResponse(
        "Authentication failed: Invalid account or insufficient permissions.",
        "AUTH_ACCOUNT_INVALID",
        401
      );
    }

    const decodedTokenData = verifyToken(token, publicKey);
    if (!decodedTokenData) {
      return authErrorResponse(
        "Authentication failed: Invalid token signature.",
        "AUTH_INVALID_TOKEN",
        401
      );
    }

    const now = Date.now();
    if (now > new Date(decodedTokenData.exp).getTime()) {
      return authErrorResponse(
        "Authentication failed: Token has expired.",
        "AUTH_TOKEN_EXPIRED",
        401
      );
    }
    if (
      decodedTokenData.nbf &&
      now < new Date(decodedTokenData.nbf).getTime()
    ) {
      return authErrorResponse(
        "Authentication failed: Token not yet active.",
        "AUTH_TOKEN_NOT_ACTIVE",
        401
      );
    }

    return { ...decodedTokenData, userId: userIdFromTokenHeader };
  } catch (e: any) {
    log.error({ error: e, token }, "Token verification failed unexpectedly.");
    return authErrorResponse(
      `Authentication failed: ${e.message || "Unknown error."}`,
      "AUTH_VERIFICATION_FAILED",
      401
    );
  }
};
