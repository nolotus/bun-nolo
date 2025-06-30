import { format, formatISO, parseISO } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { TokenRecord } from "ai/token/types";
import React, { useState, useMemo } from "react";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/settings/settingSlice";
import { useRecords, RecordsFilter } from "ai/token/hooks/useRecords";
import { selectUserId } from "auth/authSlice";
import { useTranslation } from "react-i18next";
import { ClockIcon, CalendarIcon, FilterIcon } from "@primer/octicons-react";
import Pagination from "render/web/ui/Pagination";
import { Dropdown } from "render/web/ui/Dropdown";

const ITEMS_PER_PAGE = 10;
const USER_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

const getTodayInUserTimezone = () => {
  const today = utcToZonedTime(new Date(), USER_TIMEZONE);
  return formatISO(today, { representation: "date" });
};

const formatTokensDisplay = (record: TokenRecord) =>
  `${record.input_tokens} / ${record.output_tokens}`;

const formatLocalTimeDisplay = (utcTime: string | number | Date) => {
  const date =
    typeof utcTime === "string" ? parseISO(utcTime) : new Date(utcTime);
  return format(utcToZonedTime(date, USER_TIMEZONE), "HH:mm:ss");
};

const formatPriceDisplay = (inputPrice?: number, outputPrice?: number) => {
  return inputPrice && outputPrice
    ? `${inputPrice.toFixed(4)} / ${outputPrice.toFixed(4)}`
    : "-";
};

const UsageRecord: React.FC = () => {
  const { t } = useTranslation();
  const theme = useAppSelector(selectTheme);
  const userId = useAppSelector(selectUserId);

  const [filter, setFilter] = useState<RecordsFilter>({
    date: getTodayInUserTimezone(),
    model: "全部模型",
    currentPage: 1,
  });

  const { records, loading, totalCount } = useRecords(userId, filter);

  // 从实际的 records 数据中提取模型列表
  const modelDropdownOptions = useMemo(() => {
    if (!records || records.length === 0) {
      return [{ label: t("all_models", "全部模型"), value: "全部模型" }];
    }

    // 从 records 中提取唯一的模型名称
    const uniqueModels = [
      ...new Set(records.map((record) => record.model)),
    ].sort();

    return [
      { label: t("all_models", "全部模型"), value: "全部模型" },
      ...uniqueModels.map((modelName) => ({
        label: modelName,
        value: modelName,
      })),
    ];
  }, [records, t]);

  const updateFilterState = (updates: Partial<RecordsFilter>) => {
    setFilter((prevFilter) => ({ ...prevFilter, ...updates, currentPage: 1 }));
  };

  const totalCost = records.reduce((sum, record) => sum + record.cost, 0);

  const usageRecordStyles = `
    .usage-record-container { 
      background: ${theme.background}; 
      border-radius: 16px; 
      border: 1px solid ${theme.borderLight}; 
      overflow: hidden; 
      box-shadow: 0 2px 8px ${theme.shadowLight}; 
    }
    
    .usage-record-header { 
      padding: 20px 24px; 
      background: linear-gradient(135deg, ${theme.backgroundSecondary}, ${theme.backgroundTertiary}); 
      border-bottom: 1px solid ${theme.borderLight}; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      flex-wrap: wrap; 
      gap: 20px; 
    }
    
    .usage-record-title { 
      font: 600 18px/1.4 system-ui; 
      color: ${theme.text}; 
      display: flex; 
      align-items: center; 
      gap: 8px; 
      margin: 0; 
    }
    
    .usage-record-filters { 
      display: flex; 
      gap: 12px; 
      align-items: center; 
      flex-wrap: wrap; 
    }
    
    .usage-record-date-input { 
      padding: 8px 32px 8px 12px; 
      border-radius: 8px; 
      border: 1px solid ${theme.border}; 
      background: ${theme.background}; 
      color: ${theme.text}; 
      font-size: 13px; 
      outline: none; 
    }
    .usage-record-date-input:focus { 
      border-color: ${theme.primary}; 
      box-shadow: 0 0 0 2px ${theme.primary}20; 
    }
    
    .usage-record-table { 
      width: 100%; 
      border-collapse: separate; 
      border-spacing: 0; 
    }
    .usage-record-table th { 
      background: ${theme.backgroundSecondary}; 
      color: ${theme.textSecondary}; 
      font: 600 12px/1 system-ui; 
      text-transform: uppercase; 
      padding: 12px 16px; 
      border-bottom: 1px solid ${theme.borderLight}; 
      text-align: left; 
    }
    .usage-record-table td { 
      padding: 16px; 
      border-bottom: 1px solid ${theme.borderLight}; 
      color: ${theme.text}; 
      font-size: 14px; 
    }
    .usage-record-table tr:hover { 
      background: ${theme.backgroundHover}; 
    }
    
    .usage-record-table-container { 
      padding: 20px 24px; 
      overflow-x: auto; 
    }
    
    .usage-record-cell-monospace { 
      font-family: 'SF Mono', Monaco, Consolas, monospace; 
    }
    
    .usage-record-cell-time { 
      color: ${theme.textSecondary}; 
      font-size: 13px; 
    }
    
    .usage-record-cell-cybot { 
      color: ${theme.primary}; 
      font-weight: 500; 
      max-width: 150px; 
      text-overflow: ellipsis; 
      overflow: hidden; 
      white-space: nowrap; 
    }
    
    .usage-record-cell-cost { 
      color: ${theme.primary}; 
      font-weight: 600; 
      text-align: right; 
    }
    
    .usage-record-total-section { 
      padding: 20px 24px; 
      background: ${theme.backgroundSecondary}; 
      border-top: 1px solid ${theme.borderLight}; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
    }
    
    .usage-record-total-amount { 
      font: 600 16px/1 'SF Mono', Monaco, Consolas, monospace; 
      color: ${theme.primary}; 
    }
    
    .usage-record-empty-state { 
      text-align: center; 
      padding: 40px; 
      color: ${theme.textTertiary}; 
    }
    
    .usage-record-loading-indicator { 
      display: inline-flex; 
      gap: 2px; 
      margin-left: 8px; 
    }
    
    .usage-record-loading-dot { 
      width: 4px; 
      height: 4px; 
      border-radius: 50%; 
      background: ${theme.primary}; 
      animation: usageRecordPulse 1.4s infinite; 
    }
    .usage-record-loading-dot:nth-child(2) { animation-delay: 0.2s; }
    .usage-record-loading-dot:nth-child(3) { animation-delay: 0.4s; }
    
    @keyframes usageRecordPulse { 
      0%, 80%, 100% { opacity: 0.3; } 
      40% { opacity: 1; } 
    }
    
    .usage-record-pagination-container { 
      padding: 20px 24px; 
      border-top: 1px solid ${theme.borderLight}; 
    }
  `;

  return (
    <>
      <style>{usageRecordStyles}</style>

      <div className="usage-record-container">
        <div className="usage-record-header">
          <h2 className="usage-record-title">
            <ClockIcon size={20} />
            {t("usage_records", "使用记录")}
            {loading && (
              <div className="usage-record-loading-indicator">
                <div className="usage-record-loading-dot" />
                <div className="usage-record-loading-dot" />
                <div className="usage-record-loading-dot" />
              </div>
            )}
          </h2>

          <div className="usage-record-filters">
            <input
              type="date"
              className="usage-record-date-input"
              value={filter.date}
              onChange={(e) => updateFilterState({ date: e.target.value })}
            />

            <Dropdown
              items={modelDropdownOptions}
              selectedItem={modelDropdownOptions.find(
                (option) => option.value === filter.model
              )}
              onChange={(selectedItem) =>
                updateFilterState({ model: selectedItem.value })
              }
              placeholder={t("select_model", "选择模型")}
              size="small"
              icon={<FilterIcon size={14} />}
            />
          </div>
        </div>

        <div className="usage-record-table-container">
          <table className="usage-record-table">
            <thead>
              <tr>
                <th>{t("time", "时间")}</th>
                <th>{t("robot", "机器人")}</th>
                <th>{t("tokens", "Tokens")}</th>
                <th>{t("model", "模型")}</th>
                <th>{t("input_output_price", "输入/输出价格")} (¥)</th>
                <th>{t("cost", "费用")} (¥)</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((record) => (
                  <tr key={record.id}>
                    <td className="usage-record-cell-monospace usage-record-cell-time">
                      {formatLocalTimeDisplay(record.createdAt)}
                    </td>
                    <td
                      className="usage-record-cell-cybot"
                      title={record.cybotId}
                    >
                      {record.cybotId || "-"}
                    </td>
                    <td className="usage-record-cell-monospace">
                      {formatTokensDisplay(record)}
                    </td>
                    <td>{record.model}</td>
                    <td className="usage-record-cell-monospace">
                      {formatPriceDisplay(
                        record.inputPrice,
                        record.outputPrice
                      )}
                    </td>
                    <td className="usage-record-cell-monospace usage-record-cell-cost">
                      ¥{record.cost.toFixed(4)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="usage-record-empty-state">
                    {loading
                      ? t("loading", "加载中...")
                      : t("no_data", "暂无数据")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {records.length > 0 && (
          <div className="usage-record-total-section">
            <span>
              {t("page_total", "当页合计")} ({records.length}{" "}
              {t("records", "条记录")})
            </span>
            <div className="usage-record-total-amount">
              ¥{totalCost.toFixed(4)}
            </div>
          </div>
        )}

        {totalCount > ITEMS_PER_PAGE && (
          <div className="usage-record-pagination-container">
            <Pagination
              currentPage={filter.currentPage}
              totalItems={totalCount}
              pageSize={ITEMS_PER_PAGE}
              onPageChange={(page) =>
                setFilter((prev) => ({ ...prev, currentPage: page }))
              }
            />
          </div>
        )}
      </div>
    </>
  );
};

export default UsageRecord;
