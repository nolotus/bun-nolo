import { format, formatISO, parseISO } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { TokenRecord } from "ai/token/types";
import React, { useState } from "react";
import { useTheme } from "app/theme";
import { useRecords, RecordsFilter } from "ai/token/hooks/useRecords";
import { selectCurrentUserId } from "auth/authSlice";
import { useAppSelector } from "app/hooks";
import { pino } from "pino";
import Pagination from "web/ui/Pagination";

const logger = pino({ name: "usage-record" });
const ITEMS_PER_PAGE = 10;
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const getTodayInUserTZ = () => {
  const today = new Date();
  const todayInUserTZ = utcToZonedTime(today, userTimeZone);
  return formatISO(todayInUserTZ, { representation: "date" });
};

const initialFilter: RecordsFilter = {
  date: getTodayInUserTZ(),
  model: "全部模型",
  currentPage: 1,
};

const formatTokens = (record: TokenRecord) => {
  const input = record.input_tokens;
  const output = record.output_tokens;
  return `输入:${input} 输出:${output}`;
};

const formatLocalTime = (utcTime: string | number | Date) => {
  const date =
    typeof utcTime === "string" ? parseISO(utcTime) : new Date(utcTime);
  const localDate = utcToZonedTime(date, userTimeZone);
  return format(localDate, "yyyy-MM-dd HH:mm:ss");
};

const formatPrices = (
  inputPrice: number | undefined,
  outputPrice: number | undefined
) => {
  const inputPriceStr = inputPrice !== undefined ? inputPrice.toFixed(2) : "";
  const outputPriceStr =
    outputPrice !== undefined ? outputPrice.toFixed(2) : "";
  return inputPriceStr && outputPriceStr
    ? `${inputPriceStr}/${outputPriceStr}`
    : "";
};

const UsageRecord: React.FC = () => {
  const theme = useTheme();
  const [filter, setFilter] = useState(initialFilter);
  const userId = useAppSelector(selectCurrentUserId);
  const { records, loading, totalCount } = useRecords(userId, filter);

  const handlePageChange = (page: number) => {
    setFilter((prev) => ({ ...prev, currentPage: page }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    logger.debug(
      {
        newDate,
        currentDate: filter.date,
        timeZone: userTimeZone,
      },
      "Date filter changed"
    );
    setFilter((prev) => ({ ...prev, date: newDate, currentPage: 1 }));
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    logger.debug({ newModel }, "Model filter changed");
    setFilter((prev) => ({ ...prev, model: newModel, currentPage: 1 }));
  };

  const renderTableRow = (record: TokenRecord) => (
    <tr key={record.id} className="table-row">
      <td>{formatLocalTime(record.createdAt)}</td>
      <td className="cybot-id">{record.cybotId || "-"}</td>
      <td>{formatTokens(record)}</td>
      <td>{record.model}</td>
      <td>{record.cost.toFixed(4)}</td>
      <td>{formatPrices(record.inputPrice, record.outputPrice)}</td>
    </tr>
  );

  return (
    <>
      <style>{`
        .usage-card {
          border-radius: 0px;
          padding: 24px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .title {
          font-size: 1.25rem;
          font-weight: 500;
          color: ${theme.text};
        }
        .filters {
          display: flex;
          gap: 1rem;
        }
        .input {
          padding: 8px;
          border: 1px solid ${theme.border};
          border-radius: 6px;
          color: ${theme.text};
        }
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        .table-row {
          border-bottom: 1px solid ${theme.border};
        }
        .table td, .table th {
          padding: 12px;
          color: ${theme.text};
        }
        .cybot-id {
          width: 150px; /* 限制机器人列的宽度 */
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .footer {
          margin-top: 1rem;
        }
      `}</style>

      <div className="usage-card">
        <div className="header">
          <h2 className="title">
            使用记录 {loading && "(加载中...)"}
            <span style={{ fontSize: "0.8em", color: "#666" }}>
              ({userTimeZone})
            </span>
          </h2>

          <div className="filters">
            <input
              type="date"
              className="input"
              value={filter.date}
              onChange={handleDateChange}
              title={`选择日期 (${userTimeZone})`}
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
                <th>费用(￥)</th>
                <th>输入/输出价格(￥)</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map(renderTableRow)
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    {loading ? "加载中..." : "暂无数据"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="footer">
          <Pagination
            currentPage={filter.currentPage}
            totalItems={totalCount}
            pageSize={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </>
  );
};

export default UsageRecord;
