import { useTheme } from "app/theme";
import { useEffect, useState } from "react";
import { useUserProfile } from "auth/hooks/useUserProfile";
import { useAppSelector } from "app/hooks";
import { selectCurrentUser } from "auth/authSlice";

const BalanceCard: React.FC = () => {
  const theme = useTheme();
  const currentUser = useAppSelector(selectCurrentUser);
  console.log("currentUser", currentUser);
  const fetchUserProfile = useUserProfile();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserBalance = async () => {
      if (!currentUser?.userId) {
        setError("请先登录");
        setLoading(false);
        return;
      }

      try {
        const profile = await fetchUserProfile(currentUser.userId);
        if (profile) {
          setBalance(profile.balance);
        } else {
          setError("未找到用户信息");
        }
      } catch (error) {
        const profileError = error as { message: string };
        setError(profileError.message || "加载失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    loadUserBalance();
  }, [currentUser?.userId, fetchUserProfile]);

  return (
    <div className="balance-card">
      <h2 className="balance-title">当前余额</h2>
      <div className="balance-amount">
        {loading ? (
          "加载中..."
        ) : error ? (
          <span style={{ color: theme.error }}>{error}</span>
        ) : (
          `¥ ${balance.toFixed(2)}`
        )}
      </div>
      <div className="balance-contact">
        如需充值请联系：
        <a href="mailto:s@nolotus.com" className="balance-link">
          s@nolotus.com
        </a>
      </div>
    </div>
  );
};

export default BalanceCard;
