// components/BalanceCard.tsx
import { useTheme } from "app/theme";
import { useBalance } from "auth/hooks/useBalance";
import toast from "react-hot-toast";
import { MailIcon } from "@primer/octicons-react";

const BalanceCard: React.FC = () => {
  const theme = useTheme();
  const { balance, loading, error } = useBalance();

  const copyEmail = () => {
    navigator.clipboard.writeText("s@nolotus.com");
    toast.success("邮箱已复制");
  };

  return (
    <div className="balance-card">
      <h2>当前余额</h2>
      <div className="balance-amount">
        {loading ? (
          <span className="loading">加载中...</span>
        ) : error ? (
          <span className="error">{error}</span>
        ) : (
          <span className="amount">¥ {balance.toFixed(2)}</span>
        )}
      </div>

      <div className="balance-contact">
        <span>如需充值请联系：</span>
        <button className="email-btn" onClick={copyEmail}>
          <MailIcon size={14} />
          <span>s@nolotus.com</span>
        </button>
      </div>

      <style>{`
        .balance-card {
          background: ${theme.cardBg};
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 1.5rem;
        }

        h2 {
          margin: 0 0 1rem;
          font-size: 1.25rem;
          color: ${theme.textPrimary};
          font-weight: 600;
        }

        .balance-amount {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
        }

        .amount {
          color: ${theme.primary};
        }

        .loading {
          color: ${theme.textSecondary};
          font-size: 1.5rem;
        }

        .error {
          color: ${theme.error};
          font-size: 1rem;
        }

        .balance-contact {
          font-size: 0.875rem;
          color: ${theme.textSecondary};
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .email-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border: 1px solid ${theme.borderColor};
          border-radius: 6px;
          background: transparent;
          color: ${theme.primary};
          cursor: pointer;
          transition: all 0.2s;
        }

        .email-btn:hover {
          background: ${theme.primaryLight};
          border-color: ${theme.primary};
        }
      `}</style>
    </div>
  );
};

export default BalanceCard;
