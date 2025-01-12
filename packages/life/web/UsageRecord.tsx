// UsageRecord.tsx
import React, { useState } from "react";
import { useTheme } from "app/theme";
import { useRecords, RecordsFilter } from "ai/token/hooks/useRecords";
import { TokenRecord } from "ai/token/types";
import { selectCurrentUserId } from "auth/authSlice";
import { useAppSelector } from "app/hooks";
import { pino } from "pino";
import { format, isValid, parseISO } from "date-fns";
import { createStyles } from "./styles/UsageRecord.styles.tsx";

const logger = pino({ name: "usage-record" });
const DATE_FORMAT = "yyyy-MM-dd";

const initialFilter: RecordsFilter = {
  // 初始显示用户本地时间今天
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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value; // 格式: "2024-01-15"
    setFilter((prev) => ({ ...prev, date: newDate }));
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    logger.debug({ newModel }, "Model filter changed");
    setFilter((prev) => ({ ...prev, model: newModel, currentPage: 1 }));
  };

  const renderTableRow = (record: TokenRecord) => (
    <tr key={record.id} className="table-row">
      <td>{format(record.createdAt, "yyyy-MM-dd HH:mm:ss")}</td>

      <td>{record.cybotId || "-"}</td>
      <td>{formatTokens(record)}</td>
      <td>{record.model}</td>
      <td>{record.cost.toFixed(4)}</td>
    </tr>
  );

  return (
    <>
      <style>{createStyles(theme)}</style>

      <div className="usage-card">
        <div className="header">
          <h2 className="title">使用记录 {loading && "(加载中...)"}</h2>

          <div className="filters">
            <input
              type="date"
              className="input"
              value={filter.date}
              onChange={handleDateChange}
            />
            <select
              className="input"
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
          <table className="table">
            <thead>
              <tr className="table-row">
                <th>时间</th>
                <th>机器人</th>
                <th>Tokens</th>
                <th>模型</th>
                <th>费用($)</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map(renderTableRow)
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    {loading ? "加载中..." : "暂无数据"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="footer">
          <span className="count">共 {totalCount} 条记录</span>
          <div className="pagination">
            <button
              className="button"
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
            <span style={{ padding: "8px" }}>第 {filter.currentPage} 页</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default UsageRecord;
