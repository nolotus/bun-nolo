// auth/server/login.ts
import { t } from "i18next";
import { verifyToken } from "auth/token";
import serverDb, { DB_PREFIX } from "database/server/db.js";
import { serverGetData } from "database/server/read";
import { DATABASE_DIR, DEFAULT_INDEX_FILE } from "database/init";
import {
  logger,
  createErrorResponse,
  createSuccessResponse,
  handleOptionsRequest,
} from "./shared";
import path from "path";

export async function handleLogin(req: Request) {
  if (req.method === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    const { userId, token, version } = req.body;

    if (version === "v1") {
      try {
        const user = await serverDb.get(DB_PREFIX.USER + userId);
        if (!user) {
          return createErrorResponse(
            t("errors.dataNotFound", { id: userId }),
            404
          );
        }

        const storedPublicKey = user.publicKey;
        const verification = await verifyToken(token, storedPublicKey);

        if (verification) {
          return createSuccessResponse({
            message: t("User logged in"),
            token,
          });
        }

        return createErrorResponse(t("errors.wrongPassword"), 403);
      } catch (err) {
        if (err.code === "LEVEL_NOT_FOUND") {
          return createErrorResponse(
            t("errors.dataNotFound", { id: userId }),
            404
          );
        }
        throw err;
      }
    }

    // 原来的文件系统验证逻辑
    const userDirPath = path.join(DATABASE_DIR, userId, DEFAULT_INDEX_FILE);
    const file = Bun.file(userDirPath);
    const isExist = await file.exists();

    if (!isExist) {
      return createErrorResponse(t("errors.dataNotFound", { id: userId }), 404);
    }

    const publicKeyId = `0-${userId}-publicKey`;
    const storedPublicKey = await serverGetData(publicKeyId);
    const verification = await verifyToken(token, storedPublicKey);

    if (verification) {
      return createSuccessResponse({
        message: t("User logged in"),
        token,
      });
    }

    return createErrorResponse(t("errors.wrongPassword"), 403);
  } catch (error) {
    logger.error({
      event: "login_failed",
      error: error instanceof Error ? error.message : String(error),
    });

    return createErrorResponse("Internal server error");
  }
}
