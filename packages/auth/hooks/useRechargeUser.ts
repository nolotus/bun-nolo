// hooks/useRechargeUser.js
import { useCallback } from "react";
import { API_ENDPOINTS } from "database/config";

export function useRechargeUser(serverUrl, onSuccess) {
  const rechargeUser = useCallback(
    async (userId) => {
      const amount = prompt("请输入充值金额:");
      if (!amount) return;

      try {
        const response = await fetch(
          `${serverUrl}${API_ENDPOINTS.USERS}/users/${userId}/recharge`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
    [serverUrl, onSuccess]
  );

  return rechargeUser;
}
