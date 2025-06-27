// auth/server/login.ts

import { verifyToken } from "auth/token";
import serverDb from "database/server/db.js";
import { DB_PREFIX } from "database/keys";
import i18nServer from "app/i18n/i18n.server";
import {
  logger,
  createErrorResponse,
  createSuccessResponse,
  handleOptionsRequest,
} from "./shared";

export async function handleLogin(req: Request) {
  if (req.method === "OPTIONS") {
    logger.debug({ event: "options_request", url: req.url });
    return handleOptionsRequest();
  }

  try {
    // 2. 为本次请求动态创建专属的 t 函数
    const acceptLanguage = req.headers.get("accept-language");
    const lng = acceptLanguage?.split(",")[0] || "zh-CN";
    const t = await i18nServer.cloneInstance({ lng }).init();

    logger.info({
      event: "login_attempt",
      method: req.method,
      url: req.url,
    });

    if (!req.body) {
      logger.warn({ event: "login_failed", reason: "请求体为空" });
      // 3. 使用新的、本地化的 t 函数返回错误信息
      return createErrorResponse(t("errors.requestBodyEmpty"), 400);
    }

    // 完全保留您原有的 req.body 用法
    const { userId, token } = req.body;

    if (!userId || !token) {
      logger.warn({
        event: "login_failed",
        reason: "缺少必要字段",
        userId: userId ?? "未提供",
      });
      return createErrorResponse(t("errors.missingFields"), 400);
    }

    let user;
    try {
      user = await serverDb.get(DB_PREFIX.USER + userId);
      logger.debug({
        event: "user_fetched",
        userId,
        user: user ? "已找到" : "未找到",
      });
    } catch (err) {
      logger.error({
        event: "login_failed",
        userId,
        reason: "数据库查询失败",
        error: err.message,
      });
      throw new Error(t("errors.databaseError"));
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
      return createErrorResponse(t("errors.invalidUserData"), 500);
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
      return createErrorResponse(t("errors.tokenVerificationFailed"), 403);
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
      message: t("login.success"),
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

    // 这是一个后备错误信息，在 t 函数创建失败时使用
    return createErrorResponse("内部服务器错误", 500);
  }
}
