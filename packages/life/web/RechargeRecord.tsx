// components/RechargeRecord.tsx
import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import { selectCurrentToken } from "auth/authSlice";
import { selectCurrentServer } from "app/settings/settingSlice";
import { useTranslation } from "react-i18next";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CreditCardIcon,
  ClockIcon,
} from "@primer/octicons-react";
import { API_ENDPOINTS } from "database/config";

interface TransactionRecord {
  txId: string;
  timestamp: number;
  amount: number;
  reason: string;
  status: "completed" | "failed";
  type: "recharge" | "deduct";
}

interface RechargeRecordProps {
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatReason = (reason: string): string => {
  const reasonMap: { [key: string]: string } = {
    admin_recharge: "管理员充值",
    new_user_bonus: "新用户奖励",
    invited_signup_bonus: "邀请注册奖励",
    chat_completion: "对话消耗",
    service_usage: "服务使用",
  };

  for (const key in reasonMap) {
    if (reason.startsWith(key)) {
      return reasonMap[key];
    }
  }
  return reason || "其他";
};

const RechargeRecord: React.FC<RechargeRecordProps> = ({
  isVisible,
  onToggleVisibility,
}) => {
  const { t } = useTranslation();
  const theme = useAppSelector(selectTheme);
  const token = useAppSelector(selectCurrentToken);
  const server = useAppSelector(selectCurrentServer);

  const [records, setRecords] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchRecords = useCallback(
    async (cursor: string | null) => {
      setIsLoading(true);
      setError(null);

      try {
        if (!token) {
          throw new Error("用户未登录");
        }

        const response = await fetch(server + API_ENDPOINTS.TRANSACTIONS, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            limit: 10,
            cursor,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "获取记录失败");
        }

        const { data, nextCursor: newCursor } = await response.json();
        setRecords((prevRecords) =>
          cursor ? [...prevRecords, ...data] : data
        );
        setNextCursor(newCursor);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [token, server]
  );

  useEffect(() => {
    if (isVisible && records.length === 0 && token && server) {
      fetchRecords(null);
    }
  }, [isVisible, records.length, token, server, fetchRecords]);

  const handleLoadMore = () => {
    if (nextCursor && !isLoading) {
      fetchRecords(nextCursor);
    }
  };

  // 计算当前页面总金额（收入 - 支出）
  const totalAmount = records.reduce((sum, record) => {
    return sum + (record.type === "recharge" ? record.amount : -record.amount);
  }, 0);

  const rechargeRecordStyles = `
    .transaction-record-container { 
      background: ${theme.background}; 
      border-radius: 16px; 
      border: 1px solid ${theme.borderLight}; 
      overflow: hidden; 
      box-shadow: 0 2px 8px ${theme.shadowLight}; 
      margin-bottom: 24px;
    }
    
    .transaction-record-header { 
      padding: 20px 24px; 
      background: linear-gradient(135deg, ${theme.backgroundSecondary}, ${theme.backgroundTertiary}); 
      border-bottom: 1px solid ${theme.borderLight}; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      flex-wrap: wrap; 
      gap: 20px; 
    }
    
    .transaction-record-title { 
      font: 600 18px/1.4 system-ui; 
      color: ${theme.text}; 
      display: flex; 
      align-items: center; 
      gap: 8px; 
      margin: 0; 
    }
    
    .transaction-record-toggle-button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: ${theme.primary};
      background: ${theme.backgroundGhost};
      border: 1px solid ${theme.border};
      cursor: pointer;
      transition: all 0.2s ease;
      outline: none;
    }
    .transaction-record-toggle-button:hover {
      background: ${theme.backgroundHover};
      border-color: ${theme.borderHover};
      transform: translateY(-1px);
    }
    .transaction-record-toggle-button:focus {
      border-color: ${theme.primary};
      box-shadow: 0 0 0 2px ${theme.primary}20;
    }
    
    .transaction-record-content { 
      padding: 20px 24px; 
    }
    
    .transaction-record-table { 
      width: 100%; 
      border-collapse: separate; 
      border-spacing: 0; 
    }
    .transaction-record-table th { 
      background: ${theme.backgroundSecondary}; 
      color: ${theme.textSecondary}; 
      font: 600 12px/1 system-ui; 
      text-transform: uppercase; 
      padding: 12px 16px; 
      border-bottom: 1px solid ${theme.borderLight}; 
      text-align: left; 
    }
    .transaction-record-table td { 
      padding: 16px; 
      border-bottom: 1px solid ${theme.borderLight}; 
      color: ${theme.text}; 
      font-size: 14px; 
    }
    .transaction-record-table tr:hover { 
      background: ${theme.backgroundHover}; 
    }
    .transaction-record-table tr:last-child td {
      border-bottom: none;
    }
    
    .transaction-record-amount-income { 
      color: ${theme.success || "#10B981"}; 
      font: 600 14px/1 'SF Mono', Monaco, Consolas, monospace;
    }
    .transaction-record-amount-outcome { 
      color: ${theme.error}; 
      font: 600 14px/1 'SF Mono', Monaco, Consolas, monospace;
    }
    
    .transaction-record-time { 
      color: ${theme.textSecondary}; 
      font: 13px/1 'SF Mono', Monaco, Consolas, monospace;
    }
    
    .transaction-record-status-badge { 
      padding: 4px 8px; 
      border-radius: 12px; 
      font: 600 11px/1 system-ui; 
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .transaction-record-status-completed { 
      background: ${theme.success || "#10B981"}20; 
      color: ${theme.success || "#10B981"}; 
    }
    .transaction-record-status-failed { 
      background: ${theme.error}20; 
      color: ${theme.error}; 
    }
    
    .transaction-record-empty-state { 
      text-align: center; 
      padding: 40px; 
      color: ${theme.textTertiary}; 
    }
    
    .transaction-record-error-state { 
      text-align: center; 
      padding: 40px; 
      color: ${theme.error}; 
    }
    
    .transaction-record-loading-indicator { 
      display: inline-flex; 
      gap: 2px; 
      margin-left: 8px; 
    }
    
    .transaction-record-loading-dot { 
      width: 4px; 
      height: 4px; 
      border-radius: 50%; 
      background: ${theme.primary}; 
      animation: transactionRecordPulse 1.4s infinite; 
    }
    .transaction-record-loading-dot:nth-child(2) { animation-delay: 0.2s; }
    .transaction-record-loading-dot:nth-child(3) { animation-delay: 0.4s; }
    
    @keyframes transactionRecordPulse { 
      0%, 80%, 100% { opacity: 0.3; } 
      40% { opacity: 1; } 
    }
    
    .transaction-record-total-section { 
      padding: 20px 24px; 
      background: ${theme.backgroundSecondary}; 
      border-top: 1px solid ${theme.borderLight}; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
    }
    
    .transaction-record-total-amount { 
      font: 600 16px/1 'SF Mono', Monaco, Consolas, monospace; 
      color: ${totalAmount >= 0 ? theme.success || "#10B981" : theme.error}; 
    }
    
    .transaction-record-load-more-container { 
      display: flex; 
      justify-content: center; 
      padding: 20px 24px; 
      border-top: 1px solid ${theme.borderLight}; 
    }
    
    .transaction-record-load-more-button { 
      padding: 8px 20px; 
      border-radius: 8px; 
      font: 500 13px/1 system-ui; 
      color: ${theme.primary}; 
      background: transparent; 
      border: 1px solid ${theme.border}; 
      cursor: pointer; 
      transition: all 0.2s ease;
      outline: none;
    }
    .transaction-record-load-more-button:hover:not(:disabled) { 
      background: ${theme.backgroundHover}; 
      border-color: ${theme.borderHover}; 
      transform: translateY(-1px);
    }
    .transaction-record-load-more-button:disabled { 
      cursor: not-allowed; 
      opacity: 0.6; 
    }
    
    @media (max-width: 768px) {
      .transaction-record-header {
        padding: 16px 20px;
        gap: 16px;
      }
      .transaction-record-content {
        padding: 16px 20px;
      }
      .transaction-record-total-section {
        padding: 16px 20px;
      }
      .transaction-record-load-more-container {
        padding: 16px 20px;
      }
      .transaction-record-table th,
      .transaction-record-table td {
        padding: 12px;
        font-size: 13px;
      }
    }
  `;

  const renderContent = () => {
    if (isLoading && records.length === 0) {
      return (
        <div className="transaction-record-empty-state">
          {t("loading", "加载中...")}
        </div>
      );
    }

    if (error) {
      return (
        <div className="transaction-record-error-state">错误: {error}</div>
      );
    }

    if (!records.length) {
      return (
        <div className="transaction-record-empty-state">
          {t("no_data", "暂无交易记录")}
        </div>
      );
    }

    return (
      <table className="transaction-record-table">
        <thead>
          <tr>
            <th>{t("time", "时间")}</th>
            <th>{t("amount", "金额")} (¥)</th>
            <th>{t("project", "项目")}</th>
            <th>{t("status", "状态")}</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.txId}>
              <td className="transaction-record-time">
                {formatTimestamp(record.timestamp)}
              </td>
              <td
                className={
                  record.type === "recharge"
                    ? "transaction-record-amount-income"
                    : "transaction-record-amount-outcome"
                }
              >
                {record.type === "recharge" ? "+" : "-"}¥
                {record.amount.toFixed(2)}
              </td>
              <td>{formatReason(record.reason)}</td>
              <td>
                <span
                  className={`transaction-record-status-badge transaction-record-status-${record.status}`}
                >
                  {record.status === "completed" ? "成功" : "失败"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <>
      <style>{rechargeRecordStyles}</style>

      <div className="transaction-record-container">
        <div className="transaction-record-header">
          <h2 className="transaction-record-title">
            <CreditCardIcon size={20} />
            {t("transaction_records", "交易记录")}
            {isLoading && (
              <div className="transaction-record-loading-indicator">
                <div className="transaction-record-loading-dot" />
                <div className="transaction-record-loading-dot" />
                <div className="transaction-record-loading-dot" />
              </div>
            )}
          </h2>

          <button
            className="transaction-record-toggle-button"
            onClick={onToggleVisibility}
          >
            <span>
              {isVisible ? t("collapse", "收起") : t("expand", "展开")}
            </span>
            {isVisible ? (
              <ChevronUpIcon size={14} />
            ) : (
              <ChevronDownIcon size={14} />
            )}
          </button>
        </div>

        {isVisible && (
          <>
            <div className="transaction-record-content">{renderContent()}</div>

            {records.length > 0 && (
              <div className="transaction-record-total-section">
                <span>
                  {t("page_total", "当页合计")} ({records.length}{" "}
                  {t("records", "条记录")})
                </span>
                <div className="transaction-record-total-amount">
                  ¥{totalAmount.toFixed(2)}
                </div>
              </div>
            )}

            {nextCursor && (
              <div className="transaction-record-load-more-container">
                <button
                  className="transaction-record-load-more-button"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading
                    ? t("loading", "加载中...")
                    : t("load_more", "加载更多")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default RechargeRecord;
