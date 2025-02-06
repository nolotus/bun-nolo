import { ulid } from "ulid";
import { Mutex } from "async-mutex";
import serverDb, { DB_PREFIX } from "database/server/db";
import { createTransactionKey } from "database/keys";
import { logger } from "auth/server/shared";

interface DeductResult {
  success: boolean;
  balance?: number;
  error?: string;
  txId?: string;
}

const balanceLocks = new Map<string, Mutex>();

function getBalanceLock(userId: string): Mutex {
  let lock = balanceLocks.get(userId);
  if (!lock) {
    lock = new Mutex();
    balanceLocks.set(userId, lock);
  }
  return lock;
}

async function withRetry(
  operation: () => Promise<any>,
  options: { maxAttempts: number; delayMs: number; backoff?: boolean }
) {
  let lastError = null;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt === options.maxAttempts) {
        break;
      }

      const delay = options.backoff
        ? options.delayMs * Math.pow(2, attempt - 1)
        : options.delayMs;

      logger.warn({
        event: "operation_retry",
        attempt,
        nextDelay: delay,
        error: lastError.message,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export async function deductUserBalance(
  userId: string,
  amount: number,
  reason: string,
  txId: string = ulid()
): Promise<DeductResult> {
  const lock = getBalanceLock(userId);

  return await lock.runExclusive(async () => {
    try {
      const numericAmount = Number(amount);

      logger.info({
        event: "deduct_attempt",
        userId,
        amount: numericAmount,
        reason,
        txId,
      });

      if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
        logger.warn({
          event: "deduct_invalid_amount",
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
          event: "deduct_duplicate_transaction",
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

      // 获取并验证用户数据
      const userKey = `${DB_PREFIX.USER}${userId}`;
      let userData = null;

      try {
        userData = await serverDb.get(userKey);
      } catch (err) {
        if (err instanceof Error && "notFound" in err) {
          logger.warn({
            event: "deduct_user_not_found",
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

      if (currentBalance < numericAmount) {
        logger.warn({
          event: "deduct_insufficient_balance",
          userId,
          currentBalance,
          requestedAmount: numericAmount,
          txId,
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

      // 使用重试包装批量操作
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
        event: "deduct_success",
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
        event: "deduct_error",
        userId,
        amount,
        error: error.message,
        txId,
      });

      // 如果出错，尝试记录交易失败状态
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
          event: "deduct_error_status_update_failed",
          userId,
          txId,
          error: updateError,
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
