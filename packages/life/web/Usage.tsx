// components/Usage.tsx
import React, { useState } from "react";
import { pino } from "pino";
import { useTheme } from "app/theme";
import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { clearTodayTokens, clearAllTokens } from "ai/token/clear";
import BalanceCard from "./BalanceCard";
import RechargeRecord from "./RechargeRecord";
import UsageRecord from "./UsageRecord";
import UsageChart from "./UsageChart";

const logger = pino({ name: "usage-page" });

const Usage: React.FC = () => {
  const theme = useTheme();
  const userId = useAppSelector(selectCurrentUserId);
  const [isRechargeRecordVisible, setRechargeRecordVisible] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleClearTokens = async (type: "today" | "all") => {
    const confirmMessage =
      type === "today"
        ? "确定要清除今天的token记录吗？"
        : "确定要清除所有的token记录吗？";

    if (!confirm(`${confirmMessage}\n此操作不可恢复！`)) {
      return;
    }

    try {
      setClearing(true);
      logger.info({ type }, "Starting to clear tokens");

      const clearFunction =
        type === "today" ? clearTodayTokens : clearAllTokens;
      const result = await clearFunction(userId);

      logger.info({ result }, "Tokens cleared successfully");
      alert("清除成功");
      window.location.reload();
    } catch (err) {
      logger.error({ err }, "Failed to clear tokens");
      alert("清除失败，请查看控制台日志");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="container">
      {/* <div className="actions">
        <button
          className="clear-button"
          onClick={() => handleClearTokens("today")}
          disabled={clearing}
        >
          {clearing ? "清除中..." : "清除今日记录"}
        </button>
        <button
          className="clear-button"
          onClick={() => handleClearTokens("all")}
          disabled={clearing}
        >
          {clearing ? "清除中..." : "清除所有记录"}
        </button>
      </div> */}

      <BalanceCard />

      <RechargeRecord
        isVisible={isRechargeRecordVisible}
        onToggleVisibility={() =>
          setRechargeRecordVisible(!isRechargeRecordVisible)
        }
      />

      <UsageChart />
      <UsageRecord />

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          background: ${theme.backgroundSecondary};
          min-height: 100vh;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .clear-button {
          padding: 0.625rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          color: ${theme.error};
          background: ${theme.background};
          border: 1px solid ${theme.border};
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .clear-button:hover:not(:disabled) {
          background: ${theme.backgroundGhost};
          border-color: ${theme.error};
        }

        .clear-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .clear-button:active:not(:disabled) {
          transform: translateY(1px);
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }

          .actions {
            flex-direction: column;
          }

          .clear-button {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Usage;
