// hooks/useRecords.ts
import { useState, useCallback, useEffect } from "react";
import { pino } from "pino";
import { queryUserTokens } from "ai/token/query";
import { TokenRecord } from "ai/token/types";
import { startOfDay, addDays, parseISO } from "date-fns";

const logger = pino({ name: "use-records" });

const ITEMS_PER_PAGE = 10;

export interface RecordsFilter {
  date: string; // 格式: YYYY-MM-DD
  model: string;
  currentPage: number;
}

interface UseRecordsReturn {
  records: TokenRecord[];
  loading: boolean;
  totalCount: number;
}

export const useRecords = (
  userId: string,
  filter: RecordsFilter
): UseRecordsReturn => {
  const [records, setRecords] = useState<TokenRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      // 将日期字符串解析为UTC时间
      const date = parseISO(filter.date);
      // 获取UTC日期的开始时间
      const startTime = startOfDay(date).getTime();
      // 获取下一天的UTC开始时间
      const endTime = startOfDay(addDays(date, 1)).getTime();

      logger.debug(
        {
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          filter,
        },
        "Fetching records"
      );

      const data = await queryUserTokens({
        userId,
        startTime,
        endTime,
        model: filter.model === "全部模型" ? undefined : filter.model,
        limit: ITEMS_PER_PAGE * filter.currentPage,
      });

      logger.info(
        {
          userId,
          recordCount: data.length,
          dateRange: `${new Date(startTime).toISOString()} - ${new Date(endTime).toISOString()}`,
        },
        "Records fetched"
      );

      setRecords(data);
    } catch (err) {
      logger.error({ err }, "Failed to fetch records");
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
    totalCount: records.length,
  };
};
