// hooks/useDeleteUser.ts
import { useCallback } from "react";
import { API_ENDPOINTS } from "database/config";
import pino from "pino";

const logger = pino({ name: "useDeleteUser" });

export function useDeleteUser(serverUrl: string, onSuccess?: () => void) {
  return useCallback(
    async (userId: string) => {
      if (!confirm("确认删除该用户?")) return;

      try {
        logger.info({ userId }, "Attempting to delete user");

        const response = await fetch(
          `${serverUrl}${API_ENDPOINTS.USERS}/users/${userId}`,
          { method: "DELETE" }
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
    [serverUrl, onSuccess]
  );
}
