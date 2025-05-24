// auth/hooks/useDisableUser.ts
import { useCallback } from "react";
import { useAppSelector } from "app/hooks";
import { selectCurrentServer } from "setting/settingSlice";
import { selectCurrentToken } from "auth/authSlice";
import pino from "pino";
import { authRoutes } from "auth/routes";

const logger = pino({ name: "useDisableUser" });

export function useDisableUser(onSuccess?: () => void) {
  const serverUrl = useAppSelector(selectCurrentServer);
  const token = useAppSelector(selectCurrentToken);

  return useCallback(
    async (userId: string) => {
      if (!serverUrl || !token) {
        logger.error("Missing serverUrl or token");
        return;
      }

      try {
        // 假设 authRoutes.users.disable 提供了停用用户的路径和方法
        const path = authRoutes.users.disable.createPath({ userId });
        const url = `${serverUrl}${path}`;

        logger.info({ userId, url }, "Disabling user");

        const response = await fetch(url, {
          method: authRoutes.users.disable.method, // 假设为 POST 或 PUT，具体取决于后端定义
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        logger.info({ userId }, "User disabled");
        onSuccess?.();
      } catch (err) {
        logger.error({ err, userId }, "Disable failed");
        throw err;
      }
    },
    [serverUrl, token, onSuccess]
  );
}
