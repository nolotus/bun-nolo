// UsageRecord.tsx
import React, { useState } from "react";
import { format } from "date-fns";
import { useTheme } from "app/theme";
import { useRecords, RecordsFilter } from "ai/token/hooks/useRecords";
import { TokenRecord } from "ai/token/types";
import { selectCurrentUserId } from "auth/authSlice";
import { useAppSelector } from "app/hooks";
import { pino } from "pino";

const logger = pino({ name: "usage-record" });

const initialFilter: RecordsFilter = {
  date: format(new Date(), "yyyy-MM-dd"),
  model: "全部模型",
  currentPage: 1,
};

const formatTokens = (record: TokenRecord) => {
  const input =
    record.input_tokens +
    (record.cache_creation_input_tokens || 0) +
    (record.cache_read_input_tokens || 0);
  return `输入:${input} 输出:${record.output_tokens}`;
};

const UsageRecord: React.FC = () => {
  const theme = useTheme();
  const [filter, setFilter] = useState(initialFilter);
  const userId = useAppSelector(selectCurrentUserId);
  const { records, loading, totalCount } = useRecords(userId, filter);

  const styles = {
    card: {
      background: theme.background,
      borderRadius: "12px",
      boxShadow: `0 2px 8px ${theme.shadowLight}`,
      padding: "24px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1rem",
    },
    title: {
      fontSize: "1.25rem",
      fontWeight: 500,
      color: theme.text,
    },
    filters: {
      display: "flex",
      gap: "1rem",
    },
    input: {
      padding: "8px",
      border: `1px solid ${theme.border}`,
      borderRadius: "6px",
      color: theme.text,
      background: theme.background,
    },
    table: {
      width: "100%",
      borderCollapse: "collapse" as const,
    },
    row: {
      borderBottom: `1px solid ${theme.border}`,
    },
    cell: {
      padding: "12px",
      color: theme.text,
    },
    footer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "1rem",
    },
    count: {
      color: theme.textSecondary,
    },
    pagination: {
      display: "flex",
      gap: "0.5rem",
    },
    button: {
      background: theme.primary,
      color: theme.text,
      padding: "8px 16px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      transition: "all 0.2s",
    },
  };

  // Handlers
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    logger.debug({ newDate }, "Date filter changed");
    setFilter((prev) => ({ ...prev, date: newDate, currentPage: 1 }));
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    logger.debug({ newModel }, "Model filter changed");
    setFilter((prev) => ({ ...prev, model: newModel, currentPage: 1 }));
  };

  // Render methods
  const renderTableRow = (record: TokenRecord) => (
    <tr key={record.id} style={styles.row}>
      <td style={styles.cell}>
        {format(record.createdAt, "yyyy-MM-dd HH:mm:ss")}
      </td>
      <td style={styles.cell}>{record.cybotId || "-"}</td>
      <td style={styles.cell}>{formatTokens(record)}</td>
      <td style={styles.cell}>{record.model}</td>
      <td style={styles.cell}>{record.cost.toFixed(4)}</td>
    </tr>
  );

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>使用记录 {loading && "(加载中...)"}</h2>

        <div style={styles.filters}>
          <input
            type="date"
            style={styles.input}
            value={filter.date}
            onChange={handleDateChange}
          />
          <select
            style={styles.input}
            value={filter.model}
            onChange={handleModelChange}
          >
            <option value="全部模型">全部模型</option>
            <option value="gpt-3.5-turbo">GPT-3.5</option>
            <option value="gpt-4">GPT-4</option>
            <option value="claude">Claude</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.row}>
              <th style={styles.cell}>时间</th>
              <th style={styles.cell}>机器人</th>
              <th style={styles.cell}>Tokens</th>
              <th style={styles.cell}>模型</th>
              <th style={styles.cell}>费用($)</th>
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? (
              records.map(renderTableRow)
            ) : (
              <tr>
                <td colSpan={5} style={{ ...styles.cell, textAlign: "center" }}>
                  {loading ? "加载中..." : "暂无数据"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.footer}>
        <span style={styles.count}>共 {totalCount} 条记录</span>
        <div style={styles.pagination}>
          <button
            style={styles.button}
            onClick={() =>
              setFilter((prev) => ({
                ...prev,
                currentPage: prev.currentPage - 1,
              }))
            }
            disabled={filter.currentPage === 1}
          >
            上一页
          </button>
          <span style={{ ...styles.cell, padding: "8px" }}>
            第 {filter.currentPage} 页
          </span>
        </div>
      </div>
    </div>
  );
};

export default UsageRecord;
