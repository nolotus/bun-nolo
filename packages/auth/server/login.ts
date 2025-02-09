// auth/server/login.ts
import { t } from "i18next";
import { verifyToken } from "auth/token";
import serverDb, { DB_PREFIX } from "database/server/db.js";
import {
  logger,
  createErrorResponse,
  createSuccessResponse,
  handleOptionsRequest,
} from "./shared";

export async function handleLogin(req: Request) {
  if (req.method === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    const { userId, token } = req.body;

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
  } catch (error) {
    logger.error({
      event: "login_failed",
      error: error instanceof Error ? error.message : String(error),
    });

    return createErrorResponse("Internal server error");
  }
}
