// life/web/BalanceCard.tsx
import { useTheme } from "app/theme";
import { useBalance } from "auth/hooks/useBalance";
import toast from "react-hot-toast";
import copyToClipboard from "utils/clipboard";
import { CopyIcon } from "@primer/octicons-react";

const EMAIL = "s@nolotus.com";

const BalanceCard: React.FC = () => {
  const theme = useTheme();
  const { balance, loading, error } = useBalance();

  const handleCopyEmail = () => {
    copyToClipboard(EMAIL, {
      onSuccess: () => toast.success("邮箱已复制"),
      onError: () => toast.error("复制失败,请重试"),
    });
  };

  return (
    <div className="card">
      <h2 className="title">当前余额</h2>

      <div className="balance">
        {loading ? (
          <span className="loading">加载中...</span>
        ) : error ? (
          <span className="error">{error}</span>
        ) : (
          <span>¥ {balance.toFixed(2)}</span>
        )}
      </div>

      <div className="contact">
        <span>如需充值请联系：</span>
        <button className="email-button" onClick={handleCopyEmail}>
          {EMAIL}
          <CopyIcon size={14} />
        </button>
      </div>

      <style jsx>{`
        .card {
          background: ${theme.background};
          border-radius: 12px;
          box-shadow: 0 2px 8px ${theme.shadowLight};
          padding: 24px;
          margin-bottom: 24px;
          transition: box-shadow 0.2s ease;
        }

        .card:hover {
          box-shadow: 0 4px 12px ${theme.shadowMedium};
        }

        .title {
          font-size: 1.25rem;
          font-weight: 500;
          margin: 0 0 0.5rem;
          text-align: center;
          color: ${theme.text};
        }

        .balance {
          font-size: 1.875rem;
          font-weight: 700;
          color: ${theme.primary};
          margin: 1rem 0;
          text-align: center;
        }

        .loading {
          color: ${theme.textSecondary};
          font-size: 1.25rem;
          font-weight: normal;
        }

        .error {
          color: ${theme.error};
          font-size: 1rem;
        }

        .contact {
          text-align: center;
          color: ${theme.textSecondary};
          font-size: 0.875rem;
        }

        .email-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: ${theme.primary};
          background: none;
          border: none;
          font-size: 0.875rem;
          font-weight: 500;
          margin-left: 0.5rem;
          padding: 4px 8px;
          cursor: pointer;
          transition: opacity 0.2s;
          border-radius: 4px;
        }

        .email-button:hover {
          opacity: 0.9;
          background: ${theme.backgroundLight};
        }

        @media (max-width: 640px) {
          .card {
            padding: 20px;
          }

          .balance {
            font-size: 1.5rem;
          }

          .contact {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            align-items: center;
          }

          .email-button {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default BalanceCard;
