// hooks/useRechargeUser.ts
import { ulid } from "ulid";
import { useCallback } from "react";
import { useAppDispatch } from "app/hooks";
import { write } from "database/dbSlice";
import { DataType } from "create/types";

export function useRechargeUser(onSuccess?: () => void) {
  const dispatch = useAppDispatch();

  return useCallback(
    async (userId: string, amount: number) => {
      const txId = ulid();

      try {
        const result = await dispatch(
          write({
            data: {
              type: DataType.TRANSACTION,
              transactionType: "recharge",
              userId,
              amount,
              reason: "admin_recharge",
              timestamp: Date.now(),
            },
            customId: txId,
          })
        ).unwrap();

        if (!result.success) {
          throw new Error(result.error || "充值失败");
        }

        onSuccess?.();
        return result;
      } catch (err) {
        throw err;
      }
    },
    [dispatch, onSuccess]
  );
}
