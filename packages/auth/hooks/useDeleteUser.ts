// hooks/useDeleteUser.ts
import { useCallback } from "react";
import { API_ENDPOINTS } from "database/config";
import { useAppSelector } from "app/hooks";
import { selectCurrentServer } from "setting/settingSlice";
import { selectCurrentToken } from "auth/authSlice";
import pino from "pino";

const logger = pino({ name: "useDeleteUser" });

export function useDeleteUser(onSuccess?: () => void) {
  const serverUrl = useAppSelector(selectCurrentServer);
  const token = useAppSelector(selectCurrentToken);

  return useCallback(
    async (userId: string) => {
      if (!confirm("确认删除该用户?")) return;
      if (!serverUrl || !token) {
        logger.error("No server URL or token available");
        return;
      }

      try {
        logger.info({ userId }, "Attempting to delete user");

        const response = await fetch(
          `${serverUrl}${API_ENDPOINTS.USERS}/users/${userId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Delete failed with status: ${response.status}`);
        }

        logger.info({ userId }, "User deleted successfully");
        onSuccess?.();
      } catch (err) {
        logger.error({ err, userId }, "Failed to delete user");
        alert("删除用户失败，请重试");
      }
    },
    [serverUrl, token, onSuccess]
  );
}
