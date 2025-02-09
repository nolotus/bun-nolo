import { t } from "i18next";
import serverDb, { DB_PREFIX } from "database/server/db.js";
import { reject } from "rambda";
import { signMessage } from "core/crypto";
import { generateUserIdV1 } from "core/generateMainKey";
import {
  logger,
  createErrorResponse,
  createSuccessResponse,
  handleOptionsRequest,
} from "./shared";

export async function handleSignUp(req: Request) {
  if (req.method === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    const { username, publicKey, locale, email } = req.body;

    // 记录接收到的用户名和公钥
    logger.info({ username, publicKey }, "Received signup request");

    const userId = generateUserIdV1(publicKey, username, locale);

    // 检查用户是否存在
    try {
      const existingUser = await serverDb.get(DB_PREFIX.USER + userId);
      if (existingUser) {
        return createErrorResponse(t("errors.dataExists", { id: userId }), 409);
      }
    } catch (err) {
      if (err.code !== "LEVEL_NOT_FOUND") {
        throw err;
      }
    }

    // 准备用户数据
    const userData = reject((x) => x === null || x === undefined, {
      username,
      publicKey,
      locale,
      createdAt: Date.now(),
      email,
      balance: 0,
      balanceUpdatedAt: Date.now(),
    });

    try {
      // 保存用户数据
      await serverDb.put(DB_PREFIX.USER + userId, userData);

      // 验证数据写入
      const savedUser = await serverDb.get(DB_PREFIX.USER + userId);

      // 记录保存的用户数据
      logger.debug("Saved user data:", savedUser);

      const message = JSON.stringify({
        username,
        userId,
        publicKey,
      });
      const secretKey = process.env.SECRET_KEY;

      if (!secretKey) {
        logger.error("Secret key is not defined in the environment variables.");
        return createErrorResponse(t("errors.secretKeyMissing"), 500);
      }

      const encryptedData = signMessage(message, secretKey);
      console.log("sign up encryptedData", encryptedData);

      return createSuccessResponse({ encryptedData });
    } catch (error) {
      logger.error({
        event: "signup_database_error",
        error: error instanceof Error ? error.message : String(error),
        userId,
      });
      throw error;
    }
  } catch (error) {
    logger.error({
      event: "signup_failed",
      error: error instanceof Error ? error.message : String(error),
    });
    return createErrorResponse("Internal server error");
  }
}
