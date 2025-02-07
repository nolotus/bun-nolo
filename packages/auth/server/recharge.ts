// auth/server/recharge.ts
import { ulid } from "ulid";
import { logger } from "./shared";
import serverDb, { DB_PREFIX } from "database/server/db";
import { createTransactionKey } from "database/keys";
import { balanceLockManager } from "./locks";
import { withRetry } from "./utils";

interface RechargeResult {
  success: boolean;
  balance?: number;
  error?: string;
  txId?: string;
}

export async function rechargeUserBalance(
  userId: string,
  amount: number,
  reason: string = "admin_recharge",
  txId: string = ulid()
): Promise<RechargeResult> {
  const lock = balanceLockManager.getLock(userId);

  return await lock.runExclusive(async () => {
    try {
      const numericAmount = Number(amount);

      logger.info({
        event: "recharge_attempt",
        userId,
        amount: numericAmount,
        reason,
        txId,
      });

      if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
        logger.warn({
          event: "recharge_invalid_amount",
          userId,
          amount,
          txId,
        });
        return { success: false, error: "Invalid amount" };
      }

      // 检查交易是否已存在
      const txIndexKey = createTransactionKey.index(txId);
      let existingTx = null;

      try {
        existingTx = await serverDb.get(txIndexKey);
      } catch (err) {
        if (!(err instanceof Error && "notFound" in err)) {
          throw err;
        }
      }

      if (existingTx) {
        logger.warn({
          event: "recharge_duplicate_transaction",
          txId,
          existingUserId: existingTx.userId,
          timestamp: existingTx.timestamp,
        });
        return {
          success: false,
          error: "Duplicate transaction",
          txId,
        };
      }

      const userKey = `${DB_PREFIX.USER}${userId}`;
      let userData = null;

      try {
        userData = await serverDb.get(userKey);
      } catch (err) {
        if (err instanceof Error && "notFound" in err) {
          logger.warn({
            event: "recharge_user_not_found",
            userId,
            txId,
          });
          return { success: false, error: "User not found" };
        }
        throw err;
      }

      if (!userData?.balance) {
        return { success: false, error: "User data invalid" };
      }

      const currentBalance = userData.balance;
      const newBalance = currentBalance + numericAmount;

      const txRecord = {
        txId,
        userId,
        type: "recharge",
        amount: numericAmount,
        reason,
        timestamp: Date.now(),
        status: "completed",
      };

      await withRetry(
        async () => {
          await serverDb.batch([
            {
              type: "put",
              key: createTransactionKey.record(userId, txId),
              value: txRecord,
            },
            {
              type: "put",
              key: txIndexKey,
              value: {
                userId,
                timestamp: Date.now(),
              },
            },
            {
              type: "put",
              key: userKey,
              value: {
                ...userData,
                balance: newBalance,
                lastRechargeAt: Date.now(),
              },
            },
          ]);
        },
        {
          maxAttempts: 3,
          delayMs: 1000,
          backoff: true,
        }
      );

      logger.info({
        event: "recharge_success",
        userId,
        amount: numericAmount,
        newBalance,
        txId,
      });

      return {
        success: true,
        balance: newBalance,
        txId,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error({
        event: "recharge_error",
        userId,
        amount,
        error: error.message,
        txId,
      });

      try {
        await withRetry(
          async () => {
            const txKey = createTransactionKey.record(userId, txId);
            let txRecord = null;

            try {
              txRecord = await serverDb.get(txKey);
            } catch (err) {
              if (!(err instanceof Error && "notFound" in err)) {
                throw err;
              }
            }

            if (txRecord) {
              await serverDb.put(txKey, {
                ...txRecord,
                status: "failed",
              });
            }
          },
          {
            maxAttempts: 2,
            delayMs: 500,
            backoff: true,
          }
        );
      } catch (updateError) {
        logger.error({
          event: "recharge_error_status_update_failed",
          userId,
          txId,
          error: updateError,
        });
      }

      return {
        success: false,
        error: "Internal error during recharge",
        txId,
      };
    }
  });
}
