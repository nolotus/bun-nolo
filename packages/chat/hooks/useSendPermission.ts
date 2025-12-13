// 路径: ai/hooks/useSendPermission.ts

import { useAppSelector } from "app/store";
import { selectUserId } from "auth/authSlice";
import { useTranslation } from "react-i18next";
import useAgentConfig from "ai/agent/hooks/useAgentConfig";
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

  // 是否使用自定义 API（和 schema / UI 的定义保持一致）
  const isCustomApi = cybotConfig?.apiSource === "custom";

  // 平台计费只针对非自定义 API
  const serverPrices =
    cybotConfig && !isCustomApi
      ? getModelPricing(cybotConfig.provider || "", cybotConfig.model)
      : null;

  const checkAllowSend = (): SendPermissionCheck => {
    if (!cybotConfig) {
      return { allowed: false, reason: "NO_CONFIG" };
    }

    // 1. 所有权检查
    const isOwner = currentUserId && cybotConfig.userId === currentUserId;

    // 2. 仅在“不是所有者”的情况下执行白名单检查
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

    // 3. 使用自定义 API：不走平台计费，直接允许发送
    if (isCustomApi) {
      const modelName =
        cybotConfig.customModelName?.trim() || cybotConfig.model || "custom";

      return {
        allowed: true,
        pricing: {
          modelName,
          pricePerMessage: 0,
        },
      };
    }

    // 4. 平台 / 托管 API：需要查价格 & 校验余额
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
