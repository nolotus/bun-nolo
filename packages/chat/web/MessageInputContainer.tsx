import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import type React from "react";
import { useTranslation } from "react-i18next";

import useCybotConfig from "ai/cybot/hooks/useCybotConfig";
import { getModelPricing, getFinalPrice, getPrices } from "ai/llm/getPricing";
import MessageInput from "./MessageInput";
import { handleSendMessage } from "../messages/messageSlice";
import { nolotusId } from "core/init";
import { selectCurrentUserId } from "auth/authSlice";

export interface SendPermissionCheck {
  allowed: boolean;
  reason?: "NO_CONFIG" | "NO_MODEL_PRICING" | "INSUFFICIENT_BALANCE";
  requiredAmount?: number;
}

const MessageInputContainer: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const userId = useAppSelector(selectCurrentUserId);
  const cybotConfig = useCybotConfig();
  const userBalance = 0; // TODO: 从实际状态获取用户余额

  // 获取模型价格配置
  const serverPrices = cybotConfig
    ? getModelPricing(cybotConfig.provider, cybotConfig.model)
    : null;

  const checkAllowSend = ({
    userId,
    nolotusId,
    cybotConfig,
    serverPrices,
    userBalance,
  }: {
    userId: string;
    nolotusId: string;
    cybotConfig: any;
    serverPrices: any;
    userBalance: number;
  }): SendPermissionCheck => {
    if (!cybotConfig) {
      return { allowed: false, reason: "NO_CONFIG" };
    }

    if (!serverPrices) {
      return { allowed: false, reason: "NO_MODEL_PRICING" };
    }

    if (
      userId === nolotusId ||
      userId === "Y25UeEg1VlNTanIwN2N0d1Mzb3NLRUQ3dWhzWl9hdTc0R0JoYXREeWxSbw"
    ) {
      return { allowed: true };
    }

    const prices = getPrices(cybotConfig, serverPrices);
    console.log("prices", prices);

    const maxPrice = getFinalPrice(prices);
    console.log("maxPrice", maxPrice);
    const hasEnoughBalance = userBalance >= maxPrice;

    return {
      allowed: hasEnoughBalance,
      reason: hasEnoughBalance ? undefined : "INSUFFICIENT_BALANCE",
      requiredAmount: hasEnoughBalance ? undefined : maxPrice,
    };
  };

  const sendPermission = checkAllowSend({
    userId,
    nolotusId,
    cybotConfig,
    serverPrices,
    userBalance,
  });

  const onSendMessage = (content: string) => {
    dispatch(handleSendMessage({ content }));
  };

  const getErrorMessage = (reason?: string, requiredAmount?: number) => {
    switch (reason) {
      case "NO_CONFIG":
        return t("cybotConfigMissing");
      case "NO_MODEL_PRICING":
        return t("modelPricingMissing");
      case "INSUFFICIENT_BALANCE":
        return t("insufficientBalance", { amount: requiredAmount });
      default:
        return t("noAvailableCybotMessage");
    }
  };

  const errorMessageStyle = {
    color: theme.error,
    fontSize: "14px",
    padding: ".5rem 1rem",
    backgroundColor: theme.errorBg,
    borderRadius: "4px",
    marginTop: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `0 1px 3px ${theme.shadowColor}`,
    border: `1px solid ${theme.error}20`,
  };

  return (
    <div>
      {sendPermission.allowed ? (
        <MessageInput onSendMessage={onSendMessage} />
      ) : (
        <div style={errorMessageStyle}>
          {getErrorMessage(
            sendPermission.reason,
            sendPermission.requiredAmount
          )}
        </div>
      )}
    </div>
  );
};

export default MessageInputContainer;
