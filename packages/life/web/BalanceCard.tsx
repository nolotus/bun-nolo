// life/web/BalanceCard.tsx
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import { useBalance } from "auth/hooks/useBalance";
import { useTranslation } from "react-i18next";
import { CreditCardIcon, AlertIcon } from "@primer/octicons-react";
import Button from "render/web/ui/Button";

const BalanceCard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useAppSelector(selectTheme);
  const { balance, loading, error } = useBalance();

  const handleRecharge = () => {
    navigate("/recharge");
  };

  const isLowBalance = balance < 10;

  const balanceCardStyles = `
    .balance-card-container {
      background: ${theme.background};
      border-radius: 16px;
      border: 1px solid ${theme.borderLight};
      box-shadow: 0 2px 8px ${theme.shadowLight};
      margin-bottom: 24px;
      transition: all 0.2s ease;
    }

    .balance-card-container:hover {
      box-shadow: 0 4px 12px ${theme.shadowMedium};
    }

    .balance-card-header {
      padding: 20px 24px;
      background: linear-gradient(135deg, ${theme.backgroundSecondary}, ${theme.backgroundTertiary});
      border-bottom: 1px solid ${theme.borderLight};
    }

    .balance-card-title {
      font: 600 18px/1.4 system-ui;
      color: ${theme.text};
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    .balance-card-content {
      padding: 24px;
      text-align: center;
    }

    .balance-card-amount {
      font: 700 32px/1.1 'SF Mono', Monaco, Consolas, monospace;
      color: ${isLowBalance ? theme.error : theme.primary};
      margin: 0 0 8px;
      letter-spacing: -0.5px;
    }

    .balance-card-label {
      font: 500 13px/1.4 system-ui;
      color: ${theme.textTertiary};
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 20px;
    }

    .balance-card-loading {
      color: ${theme.textSecondary};
      font: 500 16px/1.2 system-ui;
      padding: 20px;
    }

    .balance-card-error {
      color: ${theme.error};
      font: 500 14px/1.3 system-ui;
      padding: 16px;
      background: ${theme.error}10;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .balance-card-status {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 12px;
      font: 600 11px/1 system-ui;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 20px;
      background: ${isLowBalance ? theme.error : theme.success || "#10B981"}15;
      color: ${isLowBalance ? theme.error : theme.success || "#10B981"};
    }

    .balance-card-text {
      color: ${theme.textSecondary};
      font: 500 14px/1.4 system-ui;
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .balance-card-header {
        padding: 16px 20px;
      }
      .balance-card-content {
        padding: 20px;
      }
      .balance-card-amount {
        font-size: 28px;
      }
    }
  `;

  return (
    <>
      <style>{balanceCardStyles}</style>

      <div className="balance-card-container">
        <div className="balance-card-header">
          <h2 className="balance-card-title">
            <CreditCardIcon size={20} />
            {t("account_balance", "账户余额")}
          </h2>
        </div>

        <div className="balance-card-content">
          {loading ? (
            <div className="balance-card-loading">
              {t("loading_balance", "正在获取余额...")}
            </div>
          ) : error ? (
            <div className="balance-card-error">
              {t("balance_error", "获取余额失败，请刷新重试")}
            </div>
          ) : (
            <>
              <div className="balance-card-amount">¥ {balance.toFixed(2)}</div>
              <div className="balance-card-label">
                {t("available_balance", "可用余额")}
              </div>

              {isLowBalance && (
                <div className="balance-card-status">
                  <AlertIcon size={10} />
                  {t("low_balance", "余额偏低")}
                </div>
              )}

              <div className="balance-card-text">
                {isLowBalance
                  ? t("recharge_urgent_prompt", "余额不足，建议及时充值")
                  : t(
                      "recharge_normal_prompt",
                      "支持多种支付方式，充值即时到账"
                    )}
              </div>

              <Button variant="primary" size="medium" onClick={handleRecharge}>
                {t("quick_recharge", "快速充值")}
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BalanceCard;
