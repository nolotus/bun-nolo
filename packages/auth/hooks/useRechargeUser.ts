// hooks/useRechargeUser.ts
import { useCallback } from "react";
import { useAppSelector } from "app/hooks";
import { selectCurrentServer } from "setting/settingSlice";
import { selectCurrentToken } from "auth/authSlice";
import { authRoutes } from "auth/routes";
import pino from "pino";

const logger = pino({ name: "useRechargeUser" });

export function useRechargeUser(onSuccess?: () => void) {
  const serverUrl = useAppSelector(selectCurrentServer);
  const token = useAppSelector(selectCurrentToken);

  return useCallback(
    async (userId: string, amount: number) => {
      if (!serverUrl || !token) {
        logger.warn("Missing serverUrl or token");
        throw new Error("配置错误");
      }

      const path = authRoutes.users.recharge.createPath({ userId });

      logger.debug({ userId, amount }, "Attempting to recharge user");

      try {
        const response = await fetch(`${serverUrl}${path}`, {
          method: authRoutes.users.recharge.method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount }),
        });

        if (!response.ok) {
          throw new Error("充值请求失败");
        }

        logger.info({ userId, amount }, "Recharge successful");
        onSuccess?.();
      } catch (err) {
        logger.error({ err }, "Recharge failed");
        throw err;
      }
    },
    [serverUrl, token, onSuccess]
  );
}
