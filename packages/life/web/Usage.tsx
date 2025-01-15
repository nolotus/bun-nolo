import React, { useState } from "react";
import { pino } from "pino";
import BalanceCard from "./BalanceCard";
import RechargeRecord from "./RechargeRecord";
import UsageRecord from "./UsageRecord";
import UsageChart from "./UsageChart";
import { clearTodayTokens, clearAllTokens } from "ai/token/clear";
import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";

const logger = pino({ name: "usage-page" });

const Usage: React.FC = () => {
  const [isRechargeRecordVisible, setRechargeRecordVisible] = useState(false);
  const [clearing, setClearing] = useState(false);
  const userId = useAppSelector(selectCurrentUserId);

  const containerStyle: React.CSSProperties = {
    backgroundColor: "#f9fafb",
    padding: "2rem",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "8px 16px",
    margin: "0 8px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      background: "#f3f4f6",
    },
  };

  const handleClearTokens = async (type: "today" | "all") => {
    if (
      !confirm(
        `确定要清除${type === "today" ? "今天" : "所有"}的token记录吗？\n此操作不可恢复！`
      )
    ) {
      return;
    }

    try {
      setClearing(true);
      logger.info({ type }, "Starting to clear tokens");

      const result = await (
        type === "today" ? clearTodayTokens : clearAllTokens
      )(userId);

      logger.info({ result }, "Tokens cleared successfully");
      alert("清除成功");

      // 可以触发刷新
      window.location.reload();
    } catch (err) {
      logger.error({ err }, "Failed to clear tokens");
      alert("清除失败，请查看控制台日志");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "1rem",
        }}
      >
        <button
          style={{
            ...buttonStyle,
            opacity: clearing ? 0.5 : 1,
          }}
          onClick={() => handleClearTokens("today")}
          disabled={clearing}
        >
          {clearing ? "清除中..." : "清除今日记录"}
        </button>
        <button
          style={{
            ...buttonStyle,
            opacity: clearing ? 0.5 : 1,
          }}
          onClick={() => handleClearTokens("all")}
          disabled={clearing}
        >
          {clearing ? "清除中..." : "清除所有记录"}
        </button>
      </div>

      <BalanceCard />
      <RechargeRecord
        isVisible={isRechargeRecordVisible}
        onToggleVisibility={() =>
          setRechargeRecordVisible(!isRechargeRecordVisible)
        }
      />
      <UsageChart />
      <UsageRecord />
    </div>
  );
};

export default Usage;
