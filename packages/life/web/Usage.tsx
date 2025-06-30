// Usage.tsx
import React, { useState } from "react";
import { useAppSelector } from "app/store";
import { selectTheme } from "app/settings/settingSlice";
import { selectUserId } from "auth/authSlice";
import { useTranslation } from "react-i18next";
import { clearTodayTokens, clearAllTokens } from "ai/token/clear";
import { RiBarChartBoxLine } from "react-icons/ri";
import RechargeRecord from "./RechargeRecord";
import UsageRecord from "./UsageRecord";
import UsageChart from "./UsageChart";

const Usage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useAppSelector(selectTheme);
  const userId = useAppSelector(selectUserId);
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

  const usagePageStyles = `
    .usage-page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 24px;
      min-height: 100vh;
      background: ${theme.backgroundGhost || theme.backgroundSecondary};
    }

    .usage-page-header {
      margin-bottom: 32px;
      text-align: center;
    }

    .usage-page-title {
      font: 700 24px/1.2 system-ui;
      color: ${theme.text};
      margin: 0 0 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .usage-page-subtitle {
      font: 500 15px/1.4 system-ui;
      color: ${theme.textSecondary};
      margin: 0;
    }

    .usage-page-content {
      display: grid;
      gap: 24px;
    }

    @media (max-width: 768px) {
      .usage-page-container {
        padding: 20px 16px;
      }
      .usage-page-title {
        font-size: 20px;
        gap: 8px;
      }
    }
  `;

  return (
    <>
      <style>{usagePageStyles}</style>

      <div className="usage-page-container">
        <div className="usage-page-header">
          <h1 className="usage-page-title">
            <RiBarChartBoxLine size={24} />
            {t("usage_dashboard", "使用统计")}
          </h1>
          <p className="usage-page-subtitle">
            {t("usage_dashboard_subtitle", "查看充值记录和使用详情")}
          </p>
        </div>

        <div className="usage-page-content">
          <RechargeRecord
            isVisible={isRechargeRecordVisible}
            onToggleVisibility={() =>
              setRechargeRecordVisible(!isRechargeRecordVisible)
            }
          />

          <UsageChart />
          <UsageRecord />
        </div>
      </div>
    </>
  );
};

export default Usage;
