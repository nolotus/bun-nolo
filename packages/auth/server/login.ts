// auth/server/login.ts
import { t } from "i18next";
import { verifyToken } from "auth/token";
import serverDb from "database/server/db.js";
import {
  logger,
  createErrorResponse,
  createSuccessResponse,
  handleOptionsRequest,
} from "./shared";
import { DB_PREFIX } from "database/keys";

export async function handleLogin(req: Request) {
  if (req.method === "OPTIONS") {
    logger.debug({ event: "options_request", url: req.url });
    return handleOptionsRequest();
  }

  try {
    logger.info({
      event: "login_attempt",
      method: req.method,
      url: req.url,
    });

    if (!req.body) {
      logger.warn({ event: "login_failed", reason: "请求体为空" });
      return createErrorResponse("请求体为空", 400);
    }

    const { userId, token } = req.body;

    if (!userId || !token) {
      logger.warn({
        event: "login_failed",
        reason: "缺少必要字段",
        userId: userId ?? "未提供",
      });
      return createErrorResponse("缺少 userId 或 token", 400);
    }

    let user;
    try {
      user = await serverDb.get(DB_PREFIX.USER + userId);
      logger.debug({
        event: "user_fetched",
        userId,
        user: user ? JSON.stringify(user) : "未找到",
      });
    } catch (err) {
      logger.error({
        event: "login_failed",
        userId,
        reason: "数据库查询失败",
        error: err.message,
      });
      throw new Error(`数据库错误: ${err.message}`);
    }

    if (!user) {
      logger.info({
        event: "login_failed",
        userId,
        reason: "用户数据未找到",
      });
      return createErrorResponse(t("errors.dataNotFound", { id: userId }), 404);
    }

    if (!user.publicKey) {
      logger.warn({
        event: "login_failed",
        userId,
        reason: "用户缺少公钥",
      });
      return createErrorResponse("用户数据无效", 500);
    }

    let verification;
    try {
      verification = await verifyToken(token, user.publicKey);
    } catch (err) {
      logger.warn({
        event: "login_failed",
        userId,
        reason: "token 验证失败",
        error: err.message,
      });
      return createErrorResponse("token 验证错误", 403);
    }

    if (!verification) {
      logger.info({
        event: "login_failed",
        userId,
        reason: "token 验证未通过",
      });
      return createErrorResponse(t("errors.wrongPassword"), 403);
    }

    logger.info({ event: "login_success", userId });
    return createSuccessResponse({
      message: t("User logged in"),
      token,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({
      event: "login_failed",
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      url: req.url,
      method: req.method,
    });

    return createErrorResponse("内部服务器错误", 500);
  }
}
