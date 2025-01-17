// auth/hooks/useBalance.ts
import { useState, useEffect } from "react";
import { useAppSelector } from "app/hooks";
import { selectCurrentUser } from "auth/authSlice";
import { useUserProfile } from "auth/hooks/useUserProfile";

interface BalanceState {
  balance: number;
  loading: boolean;
  error: string | null;
}

export const useBalance = () => {
  const currentUser = useAppSelector(selectCurrentUser);
  const fetchUserProfile = useUserProfile();
  const [state, setState] = useState<BalanceState>({
    balance: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const loadUserBalance = async () => {
      if (!currentUser?.userId) {
        setState((prev) => ({
          ...prev,
          error: "请先登录",
          loading: false,
        }));
        return;
      }

      try {
        const profile = await fetchUserProfile(currentUser.userId);
        if (profile) {
          setState((prev) => ({
            ...prev,
            balance: profile.balance,
            error: null,
            loading: false,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            error: "未找到用户信息",
            loading: false,
          }));
        }
      } catch (error) {
        const profileError = error as { message: string };
        setState((prev) => ({
          ...prev,
          error: profileError.message || "加载失败，请稍后重试",
          loading: false,
        }));
      }
    };

    loadUserBalance();
  }, [currentUser?.userId, fetchUserProfile]);

  return state;
};
