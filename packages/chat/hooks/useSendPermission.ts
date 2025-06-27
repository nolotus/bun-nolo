import { useAppSelector } from "app/hooks";
import { selectUserId } from "auth/authSlice";
import { useTranslation } from "react-i18next";
import useAgentConfig from "ai/llm/hooks/useAgentConfig";
import { getModelPricing, getFinalPrice, getPrices } from "ai/llm/getPricing";

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
  const { t } = useTranslation("chat"); // 修改为 chat 命名空间
  const userId = useAppSelector(selectUserId);
  const cybotConfig = useAgentConfig();
  const serverPrices = cybotConfig
    ? getModelPricing(cybotConfig.provider, cybotConfig.model)
    : null;

  const checkAllowSend = (): SendPermissionCheck => {
    if (!cybotConfig) {
      return { allowed: false, reason: "NO_CONFIG" };
    }

    // 如果 provider 是 "Custom"，直接允许发送，不验证定价
    if (cybotConfig.provider === "Custom") {
      return {
        allowed: true,
        pricing: {
          modelName: cybotConfig.model,
          pricePerMessage: 0, // Custom 不需要定价，设为 0
        },
      };
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
