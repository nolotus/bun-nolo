// hooks/useRecords.ts
import { useState, useCallback, useEffect } from "react";
import { pino } from "pino";
import { queryUserTokens } from "ai/token/query";
import { TokenRecord } from "ai/token/types";

const logger = pino({ name: "use-records" });

const ITEMS_PER_PAGE = 10;

export interface RecordsFilter {
  date: string;
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
      const startTime = new Date(filter.date).getTime();
      const endTime = startTime + 24 * 60 * 60 * 1000;

      const data = await queryUserTokens({
        userId,
        startTime,
        endTime,
        model: filter.model === "全部模型" ? undefined : filter.model,
        limit: ITEMS_PER_PAGE * filter.currentPage,
      });

      logger.info({ userId, records: data.length }, "Records fetched");

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
