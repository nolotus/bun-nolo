// auth/hooks/useEnableUser.ts
import { useCallback } from "react";
import { useAppSelector } from "app/hooks";
import { selectCurrentServer } from "app/settings/settingSlice";
import { selectCurrentToken } from "auth/authSlice";
import pino from "pino";
import { authRoutes } from "auth/routes";

const logger = pino({ name: "useEnableUser" });

export function useEnableUser(onSuccess?: () => void) {
  const serverUrl = useAppSelector(selectCurrentServer);
  const token = useAppSelector(selectCurrentToken);

  return useCallback(
    async (userId: string) => {
      if (!serverUrl || !token) {
        logger.error("Missing serverUrl or token");
        return;
      }

      try {
        // 假设 authRoutes.users.enable 提供了启用用户的路径和方法
        const path = authRoutes.users.enable.createPath({ userId });
        const url = `${serverUrl}${path}`;

        logger.info({ userId, url }, "Enabling user");

        const response = await fetch(url, {
          method: authRoutes.users.enable.method, // 假设为 POST
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        logger.info({ userId }, "User enabled");
        onSuccess?.();
      } catch (err) {
        logger.error({ err, userId }, "Enable failed");
        throw err;
      }
    },
    [serverUrl, token, onSuccess]
  );
}
