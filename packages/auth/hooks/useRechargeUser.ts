// hooks/useRechargeUser.ts
import { ulid } from "ulid";
import { useCallback } from "react";
import { useAppDispatch } from "app/store";
import { write } from "database/dbSlice";
import { DataType } from "create/types";
import pino from "pino";

const logger = pino({ name: "useRechargeUser" });

interface Transaction {
  type: DataType.TRANSACTION;
  transactionType: "recharge";
  toUserId: string; // 改为 toUserId
  amount: number;
  reason: string;
  timestamp: number;
}

export class RechargeError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "RechargeError";
  }
}

export function useRechargeUser(onSuccess?: () => void) {
  const dispatch = useAppDispatch();

  return useCallback(
    async (toUserId: string, amount: number): Promise<void> => {
      // 参数名改为 toUserId
      // 参数验证
      if (!toUserId?.trim()) {
        throw new RechargeError("Invalid target user ID");
      }

      if (typeof amount !== "number" || amount <= 0) {
        throw new RechargeError("Invalid amount");
      }

      const txId = ulid();

      logger.debug({ toUserId, amount, txId }, "Starting recharge transaction");

      try {
        const transaction: Transaction = {
          type: DataType.TRANSACTION,
          transactionType: "recharge",
          toUserId, // 字段名改为 toUserId
          amount,
          reason: "admin_recharge",
          timestamp: Date.now(),
        };

        await dispatch(
          write({
            data: transaction,
            customKey: txId,
          })
        ).unwrap();

        logger.info({ toUserId, amount, txId }, "Recharge successful");
        onSuccess?.();
      } catch (err) {
        logger.error(
          { err, toUserId, amount, txId },
          "Recharge transaction failed"
        );
        throw new RechargeError("充值失败，请重试", err);
      }
    },
    [dispatch, onSuccess]
  );
}
