// ai/hooks/usePubCybots.ts

import { useEffect, useState } from "react";
import { pino } from "pino";
import { Cybot } from "../types";
import { fetchPubCybots } from "ai/cybot/web/fetchPubCybots";

const logger = pino({ name: "usePubCybots" });

interface UsePubCybotsOptions {
  limit?: number;
  sortBy?: "newest" | "popular" | "rating";
}

interface PubCybotsState {
  loading: boolean;
  error: Error | null;
  data: Cybot[];
}

export function usePubCybots(options: UsePubCybotsOptions = {}) {
  const [state, setState] = useState<PubCybotsState>({
    loading: true,
    error: null,
    data: [],
  });

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        // 获取数据
        const result = await fetchPubCybots(options);

        // 确保组件仍然挂载
        if (mounted) {
          setState({
            loading: false,
            error: null,
            data: result.data,
          });
        }
      } catch (err) {
        logger.error({ err, options }, "Failed to fetch public cybots");
        if (mounted) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error:
              err instanceof Error ? err : new Error("Failed to fetch cybots"),
          }));
        }
      }
    };

    loadData();

    // 清理函数
    return () => {
      mounted = false;
    };
  }, [options.limit, options.sortBy]);

  return state;
}
