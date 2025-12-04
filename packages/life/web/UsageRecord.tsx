// src/components/UsageRecord.tsx

import React, { useState, useMemo, useEffect } from "react";
import { format, formatISO, parseISO } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { useTranslation } from "react-i18next";
import { ClockIcon, FilterIcon } from "@primer/octicons-react";

import { TokenRecord } from "ai/token/types";
import { useRecords, RecordsFilter } from "ai/token/hooks/useRecords";
import { useAppSelector } from "app/store";
import { selectUserId } from "auth/authSlice";
import Pagination from "render/web/ui/Pagination";
import Combobox from "render/web/ui/Combobox";

const ITEMS_PER_PAGE = 10;
const USER_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

// --- Helper Functions ---
const getTodayInUserTimezone = (): string => {
  const today = utcToZonedTime(new Date(), USER_TIMEZONE);
  return formatISO(today, { representation: "date" });
};

const formatTokensDisplay = (record: TokenRecord): string =>
  `${record.input_tokens.toLocaleString()} / ${record.output_tokens.toLocaleString()}`;

const formatLocalTimeDisplay = (utcTime: string | number | Date): string => {
  const date =
    typeof utcTime === "string" ? parseISO(utcTime) : new Date(utcTime);
  return format(utcToZonedTime(date, USER_TIMEZONE), "HH:mm:ss");
};

const formatPriceDisplay = (
  inputPrice?: number,
  outputPrice?: number
): string => {
  if (inputPrice === undefined || outputPrice === undefined) return "-";
  return `${inputPrice.toFixed(4)} / ${outputPrice.toFixed(4)}`;
};

// --- Styles ---
const STYLES = `
  .usage-record {
    background: var(--background);
    border-radius: 12px;
    border: 1px solid var(--border);
    overflow: hidden;
    box-shadow: 0 1px 3px var(--shadowLight);
    display: flex;
    flex-direction: column;
  }

  .usage-record__header {
    padding: 16px 20px;
    background: var(--backgroundSecondary);
    border-bottom: 1px solid var(--borderLight);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }

  .usage-record__title {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 1rem;
    color: var(--text);
  }

  .usage-record__filters {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  /* Date Input Styling */
  .usage-record__date-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .usage-record__date-input {
    height: 32px;
    padding: 0 12px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--text);
    font-size: 0.8125rem;
    outline: none;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s;
  }

  .usage-record__date-input:hover {
    border-color: var(--textTertiary);
  }

  .usage-record__date-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--focus);
  }

  /* Table Styling */
  .usage-record__table-container {
    overflow-x: auto;
    min-height: 200px;
  }

  .usage-record__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  .usage-record__table th {
    background: var(--backgroundSecondary);
    color: var(--textSecondary);
    font-weight: 500;
    font-size: 0.75rem;
    text-transform: uppercase;
    padding: 10px 16px;
    border-bottom: 1px solid var(--borderLight);
    text-align: left;
    white-space: nowrap;
  }

  .usage-record__table td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--borderLight);
    color: var(--text);
    white-space: nowrap;
  }

  .usage-record__row:last-child td {
    border-bottom: none;
  }

  .usage-record__row:hover {
    background: var(--backgroundGhost);
  }

  .cell-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.8125rem; }
  .cell-time { color: var(--textTertiary); }
  .cell-id { color: var(--text); font-family:monospace; opacity: 0.8; max-width: 100px; overflow: hidden; text-overflow:ellipsis; }
  .cell-cost { color: var(--primary); font-weight: 600; text-align: right; }
  .cell-model { font-weight: 500; }

  .usage-record__empty {
    text-align: center;
    padding: 40px;
    color: var(--textTertiary);
  }

  .usage-record__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: var(--backgroundSecondary);
    border-top: 1px solid var(--borderLight);
    flex-wrap: wrap;
    gap: 12px;
  }

  .usage-total {
    font-size: 0.875rem;
    color: var(--textSecondary);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .usage-total strong { color: var(--primary); font-family: ui-monospace, monospace; }

  /* Pulse Animation for Loading */
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
  .animate-pulse { animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
`;

type ModelOption = { label: string; value: string };

const UsageRecord: React.FC = () => {
  const { t } = useTranslation();
  const userId = useAppSelector(selectUserId);

  const [filter, setFilter] = useState<RecordsFilter>({
    date: getTodayInUserTimezone(),
    model: "全部模型",
    currentPage: 1,
  });

  const { records, loading, totalCount } = useRecords(userId, filter);

  // 动态收集曾用过的模型
  const [modelNames, setModelNames] = useState<string[]>([]);
  useEffect(() => {
    if (!records || records.length === 0) return;
    if (filter.model !== "全部模型") return;

    const names = Array.from(new Set(records.map((r) => r.model)));
    setModelNames((prev) => Array.from(new Set([...prev, ...names])).sort());
  }, [records, filter.model]);

  const modelOptions: ModelOption[] = useMemo(
    () => [
      { label: t("all_models", "全部模型"), value: "全部模型" },
      ...modelNames.map((name) => ({ label: name, value: name })),
    ],
    [modelNames, t]
  );

  const updateFilter = (patch: Partial<RecordsFilter>) => {
    setFilter((prev) => ({ ...prev, ...patch, currentPage: 1 }));
  };

  const currentTotalCost = useMemo(
    () => records.reduce((sum, r) => sum + r.cost, 0),
    [records]
  );

  const selectedModel =
    modelOptions.find((o) => o.value === filter.model) || modelOptions[0];

  return (
    <>
      <style>{STYLES}</style>
      <div className="usage-record">
        {/* Header */}
        <div className="usage-record__header">
          <h2
            className={`usage-record__title ${loading ? "animate-pulse" : ""}`}
          >
            <ClockIcon size={18} />
            {t("usage_records", "使用记录")}
          </h2>

          <div className="usage-record__filters">
            <div className="usage-record__date-wrap">
              <input
                type="date"
                className="usage-record__date-input"
                value={filter.date}
                onChange={(e) => updateFilter({ date: e.target.value })}
              />
            </div>

            <div style={{ width: 160 }}>
              <Combobox
                items={modelOptions}
                selectedItem={selectedModel}
                onChange={(item) =>
                  updateFilter({ model: item?.value ?? "全部模型" })
                }
                placeholder={t("select_model")}
                size="small"
                variant="filled" // 使用实心风格突出操作区
                searchable // 开启搜索，方便查找模型
                icon={<FilterIcon size={14} />}
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="usage-record__table-container">
          <table className="usage-record__table">
            <thead>
              <tr>
                <th style={{ width: "10%" }}>{t("time", "时间")}</th>
                <th style={{ width: "10%" }}>{t("robot", "Robot ID")}</th>
                <th style={{ width: "15%" }}>{t("model", "模型")}</th>
                <th style={{ width: "25%" }}>Tokens (In / Out)</th>
                <th style={{ width: "25%" }}>{t("price", "价格 (¥/1k)")}</th>
                <th style={{ width: "15%", textAlign: "right" }}>
                  {t("cost", "费用")}
                </th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((r) => (
                  <tr key={r.id} className="usage-record__row">
                    <td className="cell-mono cell-time">
                      {formatLocalTimeDisplay(r.createdAt)}
                    </td>
                    <td className="cell-id" title={r.cybotId}>
                      {r.cybotId || "-"}
                    </td>
                    <td className="cell-model">{r.model}</td>
                    <td className="cell-mono">{formatTokensDisplay(r)}</td>
                    <td
                      className="cell-mono"
                      style={{ color: "var(--textTertiary)" }}
                    >
                      {formatPriceDisplay(r.inputPrice, r.outputPrice)}
                    </td>
                    <td className="cell-mono cell-cost">
                      ¥{r.cost.toFixed(4)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="usage-record__empty">
                    {loading
                      ? t("loading", "加载中...")
                      : t("no_data", "暂无数据")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        {(records.length > 0 || totalCount > 0) && (
          <div className="usage-record__footer">
            <div className="usage-total">
              {t("page_total", "本页")}:{" "}
              <strong>¥{currentTotalCost.toFixed(4)}</strong>
              <span style={{ margin: "0 8px", color: "var(--border)" }}>|</span>
              Total: {totalCount}
            </div>

            {totalCount > ITEMS_PER_PAGE && (
              <Pagination
                currentPage={filter.currentPage}
                totalItems={totalCount}
                pageSize={ITEMS_PER_PAGE}
                onPageChange={(p) =>
                  setFilter((prev) => ({ ...prev, currentPage: p }))
                }
              />
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default UsageRecord;
