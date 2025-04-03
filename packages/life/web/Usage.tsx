import React, { useState } from "react";
import { useTheme } from "app/theme";
import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { clearTodayTokens, clearAllTokens } from "ai/token/clear";
import Button from "render/web/ui/Button"; // 导入新的 Button 组件
import BalanceCard from "./BalanceCard";
import RechargeRecord from "./RechargeRecord";
import UsageRecord from "./UsageRecord";
import UsageChart from "./UsageChart";

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

      const clearFunction =
        type === "today" ? clearTodayTokens : clearAllTokens;
      const result = await clearFunction(userId);

      alert("清除成功");
      window.location.reload();
    } catch (err) {
      alert("清除失败，请查看控制台日志");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="container">
      {/* <div className="actions">
        <Button
          variant="primary"
          status="error"
          size="medium"
          onClick={() => handleClearTokens("today")}
          disabled={clearing}
          loading={clearing}
        >
          {clearing ? "清除中..." : "清除今日记录"}
        </Button>
        <Button
          variant="primary"
          status="error"
          size="medium"
          onClick={() => handleClearTokens("all")}
          disabled={clearing}
          loading={clearing}
        >
          {clearing ? "清除中..." : "清除所有记录"}
        </Button>
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
          min-height: 100vh;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }

          .actions {
            flex-direction: column;
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
