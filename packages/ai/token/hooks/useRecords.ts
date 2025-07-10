import { useState, useCallback, useEffect } from "react";
import { queryUserTokens } from "ai/token/queryUserTokens";
import { TokenRecord } from "ai/token/types";
import { startOfDay, addDays, parseISO } from "date-fns";

const ITEMS_PER_PAGE = 10;

export interface RecordsFilter {
  date: string; // 格式: YYYY-MM-DD
  model: string;
  currentPage: number;
}

interface UseRecordsReturn {
  records: TokenRecord[];
  loading: boolean;
  totalCount: number; // 现在使用后端返回的总数
}

export const useRecords = (
  userId: string,
  filter: RecordsFilter
): UseRecordsReturn => {
  const [records, setRecords] = useState<TokenRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      // 将日期字符串解析为UTC时间
      const date = parseISO(filter.date);
      // 获取UTC日期的开始时间
      const startTime = startOfDay(date).getTime();

      const result = await queryUserTokens({
        userId,
        startTime,
        model: filter.model === "全部模型" ? undefined : filter.model,
        offset: ITEMS_PER_PAGE * (filter.currentPage - 1),
        pageSize: ITEMS_PER_PAGE,
      });

      setRecords(result.records);
      setTotalCount(result.total);
    } catch (err) {
      // 移除日志记录
    } finally {
      setLoading(false);
    }
  }, [userId, filter]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    loading,
    totalCount,
  };
};
