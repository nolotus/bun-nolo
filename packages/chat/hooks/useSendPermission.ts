// 路径: ai/hooks/useSendPermission.ts (最终修正版)

import { useAppSelector } from "app/store";
import { selectUserId } from "auth/authSlice";
import { useTranslation } from "react-i18next";
import useAgentConfig from "ai/llm/hooks/useAgentConfig";
import { getModelPricing, getFinalPrice, getPrices } from "ai/llm/getPricing";

export interface SendPermissionCheck {
  allowed: boolean;
  reason?:
    | "NO_CONFIG"
    | "NO_MODEL_PRICING"
    | "INSUFFICIENT_BALANCE"
    | "NOT_IN_WHITELIST";
  requiredAmount?: number;
  pricing?: {
    modelName: string;
    pricePerMessage: number;
  };
}

export const useSendPermission = (userBalance: number = 0) => {
  const { t } = useTranslation("chat");
  const currentUserId = useAppSelector(selectUserId); // 获取当前登录用户的ID
  const cybotConfig = useAgentConfig();
  const serverPrices = cybotConfig
    ? getModelPricing(cybotConfig.provider, cybotConfig.model)
    : null;

  const checkAllowSend = (): SendPermissionCheck => {
    if (!cybotConfig) {
      return { allowed: false, reason: "NO_CONFIG" };
    }

    // [最终修正的核心改动]
    // 1. 检查Agent的所有者ID是否就是当前登录用户ID
    const isOwner = currentUserId && cybotConfig.userId === currentUserId;

    // 2. 仅在“不是所有者”的情况下，才执行白名单检查
    if (!isOwner) {
      const hasWhitelist =
        Array.isArray(cybotConfig.whitelist) &&
        cybotConfig.whitelist.length > 0;

      if (hasWhitelist) {
        const isUserInWhitelist =
          currentUserId && cybotConfig.whitelist.includes(currentUserId);

        if (!isUserInWhitelist) {
          return { allowed: false, reason: "NOT_IN_WHITELIST" };
        }
      }
    }

    // ---- 如果是所有者，或者通过了白名单检查，才会继续执行后续逻辑 ----

    if (cybotConfig.provider === "Custom") {
      return {
        allowed: true,
        pricing: { modelName: cybotConfig.model, pricePerMessage: 0 },
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
    reason?: SendPermissionCheck["reason"],
    pricing?: SendPermissionCheck["pricing"]
  ) => {
    if (reason === "NOT_IN_WHITELIST") {
      return t("notInWhitelist", "您不在该应用的白名单中，无法使用。");
    }
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
