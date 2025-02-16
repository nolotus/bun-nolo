import { rechargeUserBalance } from "auth/server/recharge";
import { nolotusId } from "core/init";

// 添加类型定义
interface TransactionData {
  transactionType: "recharge";
  amount: number;
  toUserId: string;
  reason?: string;
}

interface TransactionResponse {
  success: boolean;
  error?: string;
  [key: string]: any;
}

export const handleTransaction = async (
  data: TransactionData,
  res: Response,
  customKey: string,
  actionUserId: string
): Promise<Response> => {
  const { transactionType, amount, toUserId } = data;

  console.log("[Transaction] Start:", {
    type: transactionType,
    toUserId,
    amount,
    customKey,
  });

  if (transactionType === "recharge") {
    const isAdmin = actionUserId === nolotusId;

    if (!isAdmin) {
      console.warn("[Transaction] Permission denied:", {
        actionUserId,
        toUserId,
      });
      return res.status(403).json({
        message: "Need admin permission",
      });
    }

    console.log("[Transaction] Processing recharge:", {
      toUserId,
      amount,
      reason: data.reason,
    });

    const result = await rechargeUserBalance(
      toUserId, // 修改参数名
      amount,
      data.reason,
      customKey
    );

    if (!result.success) {
      console.error("[Transaction] Recharge failed:", {
        error: result.error,
        toUserId,
        amount,
      });
      return res.status(400).json({
        message: result.error,
        error: result.error,
      });
    }

    console.log("[Transaction] Completed successfully:", {
      toUserId,
      amount,
      result,
    });

    return res.status(200).json({
      message: "Transaction completed",
      ...result,
    });
  }

  return res.status(400).json({
    message: "Unsupported transaction type",
  });
};
