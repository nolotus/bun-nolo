// hooks/useSendPermission.ts
import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { useTranslation } from "react-i18next";
import useCybotConfig from "ai/cybot/hooks/useCybotConfig";
import { getModelPricing, getFinalPrice, getPrices } from "ai/llm/getPricing";
import { nolotusId } from "core/init";

// 定义完全跳过所有检查的ID列表
const SKIP_ALL_CHECKS_IDS = [
  nolotusId,
  "Y25UeEg1VlNTanIwN2N0d1Mzb3NLRUQ3dWhzWl9hdTc0R0JoYXREeWxSbw",
];

export interface SendPermissionCheck {
  allowed: boolean;
  reason?: "NO_CONFIG" | "NO_MODEL_PRICING" | "INSUFFICIENT_BALANCE";
  requiredAmount?: number;
}

export const useSendPermission = (userBalance: number = 0) => {
  const { t } = useTranslation();
  const userId = useAppSelector(selectCurrentUserId);
  const cybotConfig = useCybotConfig();

  const serverPrices = cybotConfig
    ? getModelPricing(cybotConfig.provider, cybotConfig.model)
    : null;

  const checkAllowSend = (): SendPermissionCheck => {
    // 首先检查是否在完全跳过检查的列表中
    if (SKIP_ALL_CHECKS_IDS.includes(userId)) {
      console.log("Send permission granted: Special user");
      return { allowed: true };
    }

    if (!cybotConfig) {
      return { allowed: false, reason: "NO_CONFIG" };
    }

    if (!serverPrices) {
      console.log("Send permission denied: No model pricing");
      return { allowed: false, reason: "NO_MODEL_PRICING" };
    }

    const prices = getPrices(cybotConfig, serverPrices);
    const maxPrice = getFinalPrice(prices);
    const hasEnoughBalance = userBalance >= maxPrice;

    return {
      allowed: hasEnoughBalance,
      reason: hasEnoughBalance ? undefined : "INSUFFICIENT_BALANCE",
      requiredAmount: hasEnoughBalance ? undefined : maxPrice,
    };
  };

  const getErrorMessage = (reason?: string, requiredAmount?: number) => {
    const message = t(
      reason === "INSUFFICIENT_BALANCE"
        ? "insufficientBalance"
        : reason === "NO_CONFIG"
          ? "cybotConfigMissing"
          : reason === "NO_MODEL_PRICING"
            ? "modelPricingMissing"
            : "noAvailableCybotMessage",
      { amount: requiredAmount }
    );

    console.log({
      debug: "Error message",
      reason,
      requiredAmount,
      message,
    });

    return message;
  };

  const sendPermission = checkAllowSend();

  return {
    sendPermission,
    getErrorMessage,
  };
};
