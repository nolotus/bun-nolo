// auth/server/recharge.ts
import { ulid } from "ulid";
import serverDb from "database/server/db";
import { createTransactionKey } from "database/keys";
import { balanceLockManager } from "./locks";
import { withRetry } from "./utils";
import pino from "pino";
import { DB_PREFIX } from "database/keys";

const logger = pino({ name: "recharge" });

interface RechargeResult {
  success: boolean;
  balance?: number;
  error?: string;
  txId?: string;
}

interface TransactionRecord {
  txId: string;
  toUserId: string;
  type: "recharge";
  amount: number;
  reason: string;
  timestamp: number;
  status: "completed" | "failed";
}

interface UserData {
  username: string;
  publicKey: string;
  locale: string;
  createdAt: number;
  email: string;
  balance: number;
  balanceUpdatedAt: number;
  [key: string]: any;
}

export async function rechargeUserBalance(
  toUserId: string,
  amount: number,
  reason: string = "admin_recharge",
  txId: string = ulid()
): Promise<RechargeResult> {
  const lock = balanceLockManager.getLock(toUserId);

  return await lock.runExclusive(async () => {
    try {
      const numericAmount = Number(amount);

      if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
        logger.warn({ toUserId, amount }, "Invalid recharge amount");
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
        logger.warn({ txId, toUserId }, "Duplicate transaction detected");
        return {
          success: false,
          error: "Duplicate transaction",
          txId,
        };
      }

      const userKey = `${DB_PREFIX.USER}${toUserId}`;
      let userData: UserData | null = null;

      try {
        userData = await serverDb.get(userKey);
        logger.debug({ toUserId, userData, userKey }, "Retrieved user data");
      } catch (err) {
        if (err instanceof Error && "notFound" in err) {
          logger.error({ toUserId, userKey }, "User not found");
          return { success: false, error: "User not found" };
        }
        throw err;
      }

      if (typeof userData?.balance !== "number") {
        logger.error(
          { toUserId, userData, userKey },
          "Invalid user data - balance must be a number"
        );
        return { success: false, error: "User data invalid" };
      }

      const currentBalance = userData.balance;
      const newBalance = currentBalance + numericAmount;

      const txRecord: TransactionRecord = {
        txId,
        toUserId,
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
              key: createTransactionKey.record(toUserId, txId),
              value: txRecord,
            },
            {
              type: "put",
              key: txIndexKey,
              value: {
                toUserId,
                timestamp: Date.now(),
              },
            },
            {
              type: "put",
              key: userKey,
              value: {
                ...userData,
                balance: newBalance,
                balanceUpdatedAt: Date.now(),
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

      logger.info(
        { toUserId, amount: numericAmount, newBalance, txId },
        "Recharge completed successfully"
      );

      return {
        success: true,
        balance: newBalance,
        txId,
      };
    } catch (err) {
      logger.error(
        { err, toUserId, amount, txId },
        "Error during recharge process"
      );

      try {
        await withRetry(
          async () => {
            const txKey = createTransactionKey.record(toUserId, txId);
            let txRecord: TransactionRecord | null = null;

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
        logger.error(
          { updateError, toUserId, txId },
          "Failed to update transaction status"
        );
      }

      return {
        success: false,
        error: "Internal error during recharge",
        txId,
      };
    }
  });
}
