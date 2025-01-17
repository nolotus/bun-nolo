// auth/server/recharge.ts
import {
  logger,
  createErrorResponse,
  createSuccessResponse,
  checkAdminPermission,
  handleOptionsRequest,
} from "./shared";
import serverDb, { DB_PREFIX } from "database/server/db";

export async function handleRechargeUser(req: Request, userId: string) {
  if (req.method === "OPTIONS") {
    return handleOptionsRequest();
  }

  const permissionError = checkAdminPermission(req);
  if (permissionError) return permissionError;

  try {
    const { amount } = req.body;
    const numericAmount = Number(amount);

    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
      return createErrorResponse("Invalid amount", 400);
    }

    const userKey = `${DB_PREFIX.USER}${userId}`;
    const userData = await serverDb.get(userKey);

    if (!userData) {
      return createErrorResponse("User not found", 404);
    }

    const currentBalance = userData.balance || 0;
    const newBalance = currentBalance + numericAmount;

    await serverDb.put(userKey, {
      ...userData,
      balance: newBalance,
      lastRechargeAt: Date.now(),
    });

    logger.info({
      event: "user_recharge_success",
      userId,
      amount: numericAmount,
      newBalance,
    });

    return createSuccessResponse({
      success: true,
      balance: newBalance,
    });
  } catch (error) {
    logger.error({
      event: "recharge_failed",
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return createErrorResponse("Internal server error");
  }
}
