import React, { useEffect, useState } from "react";
import { useTheme } from "app/theme";
import { queryUserTokens } from "ai/token/db";
import { format } from "date-fns";

interface UsageRecordProps {
  userId: string; // 添加必要的props
}

const UsageRecord: React.FC<UsageRecordProps> = ({ userId }) => {
  const theme = useTheme();

  const styles = {
    card: {
      background: theme.background,
      borderRadius: "12px",
      boxShadow: `0 2px 8px ${theme.shadowLight}`,
      padding: "24px",
      marginBottom: "24px",
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
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    tableHeader: {
      backgroundColor: theme.backgroundSecondary,
      borderBottom: `1px solid ${theme.border}`,
    },
    tableRow: {
      borderBottom: `1px solid ${theme.border}`,
    },
    input: {
      padding: "8px",
      border: `1px solid ${theme.border}`,
      borderRadius: "6px",
      color: theme.text,
      background: theme.background,
    },
  };

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    model: "",
    currentPage: 1,
  });

  const ITEMS_PER_PAGE = 10;

  // 数据获取
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const startTime = new Date(filter.date).getTime();
      const endTime = startTime + 24 * 60 * 60 * 1000; // 当天结束

      const data = await queryUserTokens({
        userId,
        startTime,
        endTime,
        model: filter.model === "全部模型" ? undefined : filter.model,
        limit: ITEMS_PER_PAGE * filter.currentPage,
      });

      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch records:", error);
      // 这里可以添加错误提示
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filter]);

  // 处理筛选变化
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter((prev) => ({ ...prev, date: e.target.value, currentPage: 1 }));
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter((prev) => ({ ...prev, model: e.target.value, currentPage: 1 }));
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    setFilter((prev) => ({ ...prev, currentPage: page }));
  };

  const formatDate = (timestamp: number) =>
    format(new Date(timestamp), "yyyy-MM-dd HH:mm");

  // 保持原有的styles...

  return (
    <div style={styles.card}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: 500, color: theme.text }}>
          使用记录 {loading && "(加载中...)"}
        </h2>
        <div style={{ display: "flex", gap: "1rem" }}>
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
            <option>全部模型</option>
            <option>GPT-3.5</option>
            <option>GPT-4</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          {/* 保持表头不变 */}
          <tbody>
            {records.map((record) => (
              <tr key={record.id} style={styles.tableRow}>
                <td style={{ padding: "12px", color: theme.text }}>
                  {formatDate(record.timestamp)}
                </td>
                <td style={{ padding: "12px", color: theme.text }}>
                  {record.name}
                </td>
                <td style={{ padding: "12px", color: theme.text }}>
                  {record.tokens}
                </td>
                <td style={{ padding: "12px", color: theme.text }}>
                  {record.model}
                </td>
                <td style={{ padding: "12px", color: theme.text }}>
                  {formatDate(record.endTimestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "1rem",
        }}
      >
        <span style={{ color: theme.textSecondary }}>
          共 {records.length} 条记录
        </span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {/* 分页按钮逻辑 */}
          <button
            style={{
              ...styles.button,
              background:
                filter.currentPage === 1
                  ? theme.backgroundSecondary
                  : theme.primary,
            }}
            onClick={() => handlePageChange(filter.currentPage - 1)}
            disabled={filter.currentPage === 1}
          >
            上一页
          </button>
          {/* 可以根据实际需求动态生成页码按钮 */}
          <button
            style={{
              ...styles.button,
              background:
                filter.currentPage === 1
                  ? theme.primary
                  : theme.backgroundSecondary,
            }}
            onClick={() => handlePageChange(1)}
          >
            1
          </button>
          {/* ... 其他页码按钮 */}
        </div>
      </div>
    </div>
  );
};

export default UsageRecord;
