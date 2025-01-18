// auth/hooks/useDeleteUser.ts
import { useCallback } from "react";
import { useAppSelector } from "app/hooks";
import { selectCurrentServer } from "setting/settingSlice";
import { selectCurrentToken } from "auth/authSlice";
import pino from "pino";
import { authRoutes } from "auth/routes";

const logger = pino({ name: "useDeleteUser" });

export function useDeleteUser(onSuccess?: () => void) {
  const serverUrl = useAppSelector(selectCurrentServer);
  const token = useAppSelector(selectCurrentToken);

  return useCallback(
    async (userId: string) => {
      if (!serverUrl || !token) {
        logger.error("Missing serverUrl or token");
        return;
      }

      try {
        const path = authRoutes.users.delete.createPath({ userId });
        const url = `${serverUrl}${path}`;

        logger.info({ userId, url }, "Deleting user");

        const response = await fetch(url, {
          method: authRoutes.users.delete.method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        logger.info({ userId }, "User deleted");
        onSuccess?.();
      } catch (err) {
        logger.error({ err, userId }, "Delete failed");
        throw err;
      }
    },
    [serverUrl, token, onSuccess]
  );
}
