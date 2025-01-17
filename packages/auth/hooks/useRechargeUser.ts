// hooks/useRechargeUser.ts
import { useCallback } from "react";
import { useAppSelector } from "app/hooks";
import { selectCurrentServer } from "setting/settingSlice";
import { selectCurrentToken } from "auth/authSlice";
import { authRoutes } from "auth/routes";

export function useRechargeUser(onSuccess?: () => void) {
  const serverUrl = useAppSelector(selectCurrentServer);
  const token = useAppSelector(selectCurrentToken);

  return useCallback(
    async (userId: string) => {
      const amount = prompt("请输入充值金额:");
      if (!amount || !serverUrl || !token) return;

      const path = authRoutes.users.recharge.createPath({ userId });

      try {
        const response = await fetch(`${serverUrl}${path}`, {
          method: authRoutes.users.recharge.method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: Number(amount) }),
        });

        if (!response.ok) {
          throw new Error("充值失败");
        }

        alert("充值成功");
        onSuccess?.();
      } catch (err) {
        console.error({
          level: "error",
          event: "recharge_request_failed",
          error: err.message,
        });
        alert("充值失败，请重试");
      }
    },
    [serverUrl, token, onSuccess]
  );
}
