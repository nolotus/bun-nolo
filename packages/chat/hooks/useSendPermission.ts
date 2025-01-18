import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { useTranslation } from "react-i18next";
import useCybotConfig from "ai/cybot/hooks/useCybotConfig";
import { getModelPricing, getFinalPrice, getPrices } from "ai/llm/getPricing";
import { nolotusId } from "core/init";

const SKIP_ALL_CHECKS_IDS = [
  nolotusId,
  "Y25UeEg1VlNTanIwN2N0d1Mzb3NLRUQ3dWhzWl9hdTc0R0JoYXREeWxSbw",
];

export interface SendPermissionCheck {
  allowed: boolean;
  reason?: "NO_CONFIG" | "NO_MODEL_PRICING" | "INSUFFICIENT_BALANCE";
  requiredAmount?: number;
  pricing?: {
    modelName: string;
    pricePerMessage: number;
  };
}

export const useSendPermission = (userBalance: number = 0) => {
  const { t } = useTranslation("ai");
  const userId = useAppSelector(selectCurrentUserId);
  const cybotConfig = useCybotConfig();
  const serverPrices = cybotConfig
    ? getModelPricing(cybotConfig.provider, cybotConfig.model)
    : null;

  const checkAllowSend = (): SendPermissionCheck => {
    if (SKIP_ALL_CHECKS_IDS.includes(userId)) {
      return { allowed: true };
    }

    if (!cybotConfig) {
      return { allowed: false, reason: "NO_CONFIG" };
    }

    if (!serverPrices) {
      return { allowed: false, reason: "NO_MODEL_PRICING" };
    }

    const prices = getPrices(cybotConfig, serverPrices);
    const maxPrice = getFinalPrice(prices);
    const hasEnoughBalance = userBalance >= maxPrice;

    return {
      allowed: hasEnoughBalance,
      reason: hasEnoughBalance ? undefined : "INSUFFICIENT_BALANCE",
      requiredAmount: hasEnoughBalance ? undefined : maxPrice,
      pricing: {
        modelName: cybotConfig.model,
        pricePerMessage: maxPrice,
      },
    };
  };

  const getErrorMessage = (
    reason?: string,
    pricing?: SendPermissionCheck["pricing"]
  ) => {
    if (reason === "INSUFFICIENT_BALANCE" && pricing) {
      return t("insufficientBalanceDetailed", {
        modelName: pricing.modelName,
        pricePerMessage: pricing.pricePerMessage.toFixed(2),
        balance: userBalance.toFixed(2),
      });
    }

    return t(
      reason === "NO_CONFIG"
        ? "cybotConfigMissing"
        : reason === "NO_MODEL_PRICING"
          ? "modelPricingMissing"
          : "noAvailableCybotMessage"
    );
  };

  const sendPermission = checkAllowSend();

  return {
    sendPermission,
    getErrorMessage,
  };
};
