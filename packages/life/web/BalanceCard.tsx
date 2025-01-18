// components/BalanceCard.tsx
import { useTheme } from "app/theme";
import { useBalance } from "auth/hooks/useBalance";

const BalanceCard: React.FC = () => {
  const theme = useTheme();
  const { balance, loading, error } = useBalance();

  return (
    <div className="balance-card">
      <h2>当前余额</h2>
      <div className="balance-amount">
        {loading ? (
          "加载中..."
        ) : error ? (
          <span className="error">{error}</span>
        ) : (
          `¥ ${balance.toFixed(6)}`
        )}
      </div>
      <div className="balance-contact">
        如需充值请联系：
        <a href="mailto:s@nolotus.com">s@nolotus.com</a>
      </div>

      <style>{`
        .balance-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 1.5rem;
        }
        
        .balance-card h2 {
          margin: 0 0 1rem;
          font-size: 1.25rem;
          color: #374151;
        }
        
        .balance-amount {
          font-size: 2rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 1rem;
        }
        
        .error {
          color: ${theme.error};
        }
        
        .balance-contact {
          font-size: 0.875rem;
          color: #6B7280;
        }
        
        .balance-contact a {
          color: #3B82F6;
          text-decoration: none;
          margin-left: 0.5rem;
        }
        
        .balance-contact a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default BalanceCard;
