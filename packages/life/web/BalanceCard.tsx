// components/BalanceCard.tsx
import { useTheme } from "app/theme";
import { useBalance } from "auth/hooks/useBalance";

const BalanceCard: React.FC = () => {
  const theme = useTheme();
  const { balance, loading, error } = useBalance();

  return (
    <div className="balance-card">
      <h2 className="balance-title">当前余额</h2>
      <div className="balance-amount">
        {loading ? (
          "加载中..."
        ) : error ? (
          <span style={{ color: theme.error }}>{error}</span>
        ) : (
          `¥ ${balance.toFixed(6)}`
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
