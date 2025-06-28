// components/RechargeRecord.tsx
import { useState, useEffect, useCallback } from "react";
import { useTheme } from "app/theme";
import { ChevronDownIcon, ChevronUpIcon } from "@primer/octicons-react";
import { Table, TableRow, TableCell } from "render/web/ui/Table";
import { API_ENDPOINTS } from "database/config";
import { useAppSelector } from "app/hooks";
import { selectCurrentToken } from "auth/authSlice";
import { selectCurrentServer } from "setting/settingSlice";

// 1. 更新接口：添加 'type' 字段来区分交易类型
interface TransactionRecord {
  txId: string;
  timestamp: number;
  amount: number;
  reason: string;
  status: "completed" | "failed";
  type: "recharge" | "deduct"; // <--- 关键字段
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
  // 扩展原因映射，包含支出类型
  const reasonMap: { [key: string]: string } = {
    admin_recharge: "管理员充值",
    new_user_bonus: "新用户奖励",
    invited_signup_bonus: "邀请注册奖励",
    // 示例支出原因
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
  const theme = useTheme();
  const token = useAppSelector(selectCurrentToken);
  const server = useAppSelector(selectCurrentServer);
  const [records, setRecords] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // 4. 修复 useCallback 依赖：添加 token 和 server
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
    [token, server] // <--- 修复依赖项
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

  const renderContent = () => {
    if (isLoading && records.length === 0) {
      return <div className="status-text">加载中...</div>;
    }
    if (error) {
      return <div className="status-text error-text">错误: {error}</div>;
    }
    if (!records.length) {
      return <div className="status-text">暂无交易记录</div>;
    }

    return (
      <Table>
        <thead>
          <TableRow>
            <TableCell element={{ header: true }}>时间</TableCell>
            <TableCell element={{ header: true }}>金额</TableCell>
            <TableCell element={{ header: true }}>项目</TableCell>
            <TableCell element={{ header: true }}>状态</TableCell>
          </TableRow>
        </thead>
        <tbody>
          {records.map((record) => (
            <TableRow key={record.txId}>
              <TableCell element={{}}>
                {formatTimestamp(record.timestamp)}
              </TableCell>
              {/* 3. 根据交易类型区分显示金额和样式 */}
              <TableCell
                element={{}}
                className={
                  record.type === "recharge"
                    ? "amount-income"
                    : "amount-outcome"
                }
              >
                {record.type === "recharge" ? "+" : "-"}
                {record.amount.toFixed(2)}
              </TableCell>
              <TableCell element={{}}>{formatReason(record.reason)}</TableCell>
              <TableCell element={{}}>
                <span className={`status-badge status-${record.status}`}>
                  {record.status === "completed" ? "成功" : "失败"}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        {/* 2. 更改标题为更通用的 "交易记录" */}
        <h2 className="title">交易记录</h2>
        <button className="toggle-button" onClick={onToggleVisibility}>
          {isVisible ? (
            <>
              <span>收起</span>
              <ChevronUpIcon size={16} />
            </>
          ) : (
            <>
              <span>展开</span>
              <ChevronDownIcon size={16} />
            </>
          )}
        </button>
      </div>

      {isVisible && (
        <div className="content-wrapper">
          {renderContent()}
          {nextCursor && (
            <div className="load-more-container">
              <button
                className="load-more-button"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? "加载中..." : "加载更多"}
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        /* ... 其他样式保持不变 ... */
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
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: ${isVisible ? "1rem" : "0"};
        }
        .title {
          font-size: 1.25rem;
          font-weight: 500;
          color: ${theme.text};
          margin: 0;
        }
        .toggle-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          color: ${theme.primary};
          background: transparent;
          border: 1px solid ${theme.border};
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .toggle-button:hover {
          background: ${theme.backgroundSecondary};
          border-color: ${theme.borderHover};
        }
        .content-wrapper {
          margin-top: 1rem;
        }
        .status-text {
          color: ${theme.textSecondary};
          padding: 2rem 0;
          text-align: center;
        }
        .error-text {
          color: ${theme.error};
        }
        .status-badge {
          padding: 0.25rem 0.6rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          background-color: ${theme.backgroundSecondary};
          color: ${theme.textSecondary};
        }
        .status-completed {
          background-color: ${theme.successBackground};
          color: ${theme.success};
        }
        .status-failed {
          background-color: ${theme.errorBackground};
          color: ${theme.error};
        }

        /* 新增用于区分收入和支出的样式 */
        .amount-income {
          color: ${theme.success};
          font-weight: 500;
        }
        .amount-outcome {
          color: ${theme.error};
        }

        .load-more-container {
          display: flex;
          justify-content: center;
          margin-top: 1.5rem;
        }
        .load-more-button {
          padding: 0.5rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          color: ${theme.primary};
          background: transparent;
          border: 1px solid ${theme.border};
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .load-more-button:hover:not(:disabled) {
          background: ${theme.backgroundSecondary};
          border-color: ${theme.borderHover};
        }
        .load-more-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        @media (max-width: 640px) {
          .card {
            padding: 16px;
          }
          .toggle-button {
            padding: 0.375rem 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RechargeRecord;
