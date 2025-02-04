// ai/hooks/usePubCybots.ts

import { useEffect, useState, useCallback } from "react";
import { Cybot } from "../types";
import { fetchPubCybots as fetchLocal } from "ai/cybot/web/fetchPubCybots";
import { useAppSelector } from "app/hooks";
import { selectCurrentServer } from "setting/settingSlice";

interface UsePubCybotsOptions {
  limit?: number;
  sortBy?: "newest" | "popular" | "rating";
}

interface PubCybotsState {
  loading: boolean;
  error: Error | null;
  data: Cybot[];
}

function mergeCybots(localData: Cybot[], remoteData: Cybot[]): Cybot[] {
  const merged = [...localData];
  const ids = new Set(localData.map((bot) => bot.id));

  let addedCount = 0;
  remoteData.forEach((bot) => {
    if (!ids.has(bot.id)) {
      merged.push(bot);
      addedCount++;
    }
  });

  return merged.sort((a, b) => {
    const timeA =
      typeof a.createdAt === "string" ? Date.parse(a.createdAt) : a.createdAt;
    const timeB =
      typeof b.createdAt === "string" ? Date.parse(b.createdAt) : b.createdAt;
    return timeB - timeA;
  });
}

export function usePubCybots({
  limit = 20,
  sortBy = "newest",
}: UsePubCybotsOptions = {}) {
  const currentServer = useAppSelector(selectCurrentServer);
  const [state, setState] = useState<PubCybotsState>({
    loading: true,
    error: null,
    data: [],
  });

  const fetchData = useCallback(async () => {
    if (!currentServer) {
      try {
        const localResult = await fetchLocal({ limit, sortBy });
        setState({
          loading: false,
          error: null,
          data: localResult.data,
        });
      } catch (err) {
        setState({
          loading: false,
          error:
            err instanceof Error
              ? err
              : new Error("Failed to fetch local cybots"),
          data: [],
        });
      }
      return;
    }

    try {
      const localResult = await fetchLocal({ limit, sortBy });

      setState((prev) => ({
        ...prev,
        loading: true,
        data: localResult.data,
      }));

      try {
        const response = await fetch(`${currentServer}/rpc/getPubCybots`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            limit,
            sortBy,
          }),
        });

        if (!response.ok) {
          throw new Error(`Remote fetch failed with status ${response.status}`);
        }

        const remoteResult = await response.json();

        const mergedData = mergeCybots(localResult.data, remoteResult.data);

        setState({
          loading: false,
          error: null,
          data: mergedData,
        });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: null,
        }));
      }
    } catch (err) {
      setState({
        loading: false,
        error: err instanceof Error ? err : new Error("Failed to fetch cybots"),
        data: [],
      });
    }
  }, [limit, sortBy, currentServer]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const retry = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetchData();
  }, [fetchData]);

  return { ...state, retry };
}
