// hooks/useRechargeUser.ts
import { useCallback } from "react";
import { API_ENDPOINTS } from "database/config";
import { useAppSelector } from "app/hooks";
import { selectCurrentServer } from "setting/settingSlice";
import { selectCurrentToken } from "auth/authSlice";

export function useRechargeUser(onSuccess?: () => void) {
  const serverUrl = useAppSelector(selectCurrentServer);
  const token = useAppSelector(selectCurrentToken);

  return useCallback(
    async (userId: string) => {
      const amount = prompt("请输入充值金额:");
      if (!amount || !serverUrl || !token) return;

      try {
        const response = await fetch(
          `${serverUrl}${API_ENDPOINTS.USERS}/users/${userId}/recharge`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ amount: Number(amount) }),
          }
        );

        if (!response.ok) {
          throw new Error("充值失败");
        }

        alert("充值成功");
        onSuccess?.();
      } catch (err) {
        alert("充值失败，请重试");
      }
    },
    [serverUrl, token, onSuccess]
  );
}
