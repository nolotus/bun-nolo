// auth/server/deduct.ts
import { logger } from "./shared";
import serverDb, { DB_PREFIX } from "database/server/db";
import { format } from "date-fns";

interface DeductResult {
  success: boolean;
  balance?: number;
  error?: string;
}

/**
 * Internal function to deduct balance from user account
 * @param userId User ID to deduct from
 * @param amount Amount to deduct (must be positive)
 * @param reason Reason for deduction (for logging)
 */
export async function deductUserBalance(
  userId: string,
  amount: number,
  reason: string
): Promise<DeductResult> {
  try {
    const numericAmount = Number(amount);

    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
      return { success: false, error: "Invalid amount" };
    }

    const userKey = `${DB_PREFIX.USER}${userId}`;
    const userData = await serverDb.get(userKey);

    if (!userData) {
      return { success: false, error: "User not found" };
    }

    const currentBalance = userData.balance || 0;

    // Check if user has sufficient balance
    if (currentBalance < numericAmount) {
      logger.warn({
        event: "insufficient_balance",
        userId,
        requestedAmount: numericAmount,
        currentBalance,
        reason,
      });
      return { success: false, error: "Insufficient balance" };
    }

    const newBalance = currentBalance - numericAmount;

    await serverDb.put(userKey, {
      ...userData,
      balance: newBalance,
      lastDeductAt: Date.now(),
    });

    logger.info({
      event: "balance_deduct_success",
      userId,
      amount: numericAmount,
      newBalance,
      reason,
      timestamp: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    });

    return {
      success: true,
      balance: newBalance,
    };
  } catch (error) {
    logger.error({
      event: "deduct_failed",
      userId,
      amount,
      reason,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: "Internal error during deduction",
    };
  }
}
