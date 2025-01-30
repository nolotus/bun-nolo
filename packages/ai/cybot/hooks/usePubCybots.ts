// ai/hooks/usePubCybots.ts

import { useEffect, useState, useCallback } from "react";
import { pino } from "pino";
import { Cybot } from "../types";
import { fetchPubCybots as fetchLocal } from "ai/cybot/web/fetchPubCybots";
import { useAppSelector } from "app/hooks";
import { selectCurrentServer } from "setting/settingSlice";

const logger = pino({
  name: "hooks:usePubCybots",
  level: "debug",
});

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

  logger.debug(
    {
      localCount: localData.length,
      remoteCount: remoteData.length,
      newlyAdded: addedCount,
      totalMerged: merged.length,
      latestCreatedAt: merged[0]?.createdAt,
    },
    "Merged cybot data"
  );

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
      logger.warn("No server specified, falling back to local data only");
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

    logger.debug(
      { limit, sortBy, server: currentServer },
      "Starting cybot fetch"
    );

    try {
      const localResult = await fetchLocal({ limit, sortBy });
      logger.debug({ count: localResult.data.length }, "Local data loaded");

      setState((prev) => ({
        ...prev,
        loading: true,
        data: localResult.data,
      }));

      try {
        logger.debug({ server: currentServer }, "Fetching remote data");
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
        logger.debug({ count: remoteResult.data.length }, "Remote data loaded");

        const mergedData = mergeCybots(localResult.data, remoteResult.data);

        setState({
          loading: false,
          error: null,
          data: mergedData,
        });

        logger.debug(
          {
            finalCount: mergedData.length,
            sortBy,
            limit,
            server: currentServer,
            latestCreatedAt: mergedData[0]?.createdAt,
          },
          "Cybot data fetch completed"
        );
      } catch (err) {
        logger.warn(
          {
            err,
            localDataCount: localResult.data.length,
            server: currentServer,
          },
          "Remote fetch failed, falling back to local data"
        );

        setState((prev) => ({
          ...prev,
          loading: false,
          error: null,
        }));
      }
    } catch (err) {
      logger.error(
        {
          err,
          sortBy,
          limit,
          server: currentServer,
        },
        "Complete fetch failure - both local and remote failed"
      );

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
