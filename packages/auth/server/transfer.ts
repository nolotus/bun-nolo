import {
  logger,
  createErrorResponse,
  createSuccessResponse,
  checkAdminPermission,
  handleOptionsRequest,
} from "./shared";
import { rechargeUserBalance } from "./recharge";
// HTTP 处理层
export async function handleTransferUser(req: Request, userId: string) {
  if (req.method === "OPTIONS") {
    return handleOptionsRequest();
  }

  const permissionError = checkAdminPermission(req);
  if (permissionError) return permissionError;

  try {
    const { amount } = req.body;
    const result = await rechargeUserBalance(userId, amount);

    if (!result.success) {
      return createErrorResponse(result.error || "Recharge failed", 400);
    }

    return createSuccessResponse({
      success: true,
      balance: result.balance,
      txId: result.txId,
    });
  } catch (error) {
    logger.error({
      event: "http_recharge_failed",
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return createErrorResponse("Internal server error");
  }
}
