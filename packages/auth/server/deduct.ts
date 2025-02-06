// auth/server/deduct.ts
import { ulid } from "ulid";
import serverDb, { DB_PREFIX } from "database/server/db";
import { createTransactionKey } from "database/keys";
import { logger } from "auth/server/shared";
import { balanceLockManager } from "./locks";
import { withRetry } from "./utils";

interface DeductResult {
  success: boolean;
  balance?: number;
  error?: string;
  txId?: string;
}

// 日志格式化helper
const formatLogMsg = (event: string, txId: string) =>
  `[Deduct] ${event} (txId: ${txId})`;

export async function deductUserBalance(
  userId: string,
  amount: number,
  reason: string,
  txId: string = ulid()
): Promise<DeductResult> {
  const lock = balanceLockManager.getLock(userId);

  return await lock.runExclusive(async () => {
    try {
      const numericAmount = Number(amount);

      logger.info({
        msg: formatLogMsg("Deduction attempt", txId),
        userId,
        amount: numericAmount,
        reason,
      });

      if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
        logger.warn({
          msg: formatLogMsg("Invalid amount", txId),
          userId,
          amount,
        });
        return { success: false, error: "Invalid amount" };
      }

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
          msg: formatLogMsg("Duplicate transaction", txId),
          existingUserId: existingTx.userId,
          timestamp: new Date(existingTx.timestamp).toISOString(),
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
            msg: formatLogMsg("User not found", txId),
            userId,
          });
          return { success: false, error: "User not found" };
        }
        throw err;
      }

      if (!userData?.balance) {
        logger.warn({
          msg: formatLogMsg("Invalid user data", txId),
          userId,
        });
        return { success: false, error: "User data invalid" };
      }

      const currentBalance = userData.balance;

      if (currentBalance < numericAmount) {
        logger.warn({
          msg: formatLogMsg("Insufficient balance", txId),
          userId,
          currentBalance,
          requestedAmount: numericAmount,
        });
        return { success: false, error: "Insufficient balance" };
      }

      const newBalance = currentBalance - numericAmount;

      const txRecord = {
        txId,
        userId,
        type: "deduct",
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
                lastDeductAt: Date.now(),
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
        msg: formatLogMsg("Deduction successful", txId),
        userId,
        deductedAmount: numericAmount,
        newBalance,
      });

      return {
        success: true,
        balance: newBalance,
        txId,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error({
        msg: formatLogMsg("Deduction failed", txId),
        userId,
        amount,
        error: error.message,
        stack: error.stack,
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
          msg: formatLogMsg("Failed to update error status", txId),
          userId,
          error:
            updateError instanceof Error
              ? updateError.message
              : String(updateError),
        });
      }

      return {
        success: false,
        error: "Internal error during deduction",
        txId,
      };
    }
  });
}
