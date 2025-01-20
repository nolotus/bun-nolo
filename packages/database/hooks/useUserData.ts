// database/hooks/useUserData.ts

import { useEffect, useState, useCallback } from "react";
import { fetchUserData } from "../browser/fetchUserData";
import { DataType } from "create/types";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { selectCurrentServer } from "setting/settingSlice";
import { noloQueryRequest } from "../client/queryRequest";
import { upsertMany } from "database/dbSlice";
import pino from "pino";

const logger = pino({
  name: "useUserData",
  level: "debug",
});

interface FetchState {
  loading: boolean;
  error: Error | null;
  data: any[];
}

interface UseUserDataReturn extends FetchState {
  reload: () => Promise<void>;
}

function normalizeRemoteData(remoteResult: any) {
  if (remoteResult?.data && Array.isArray(remoteResult.data)) {
    return remoteResult.data;
  }
  return [];
}

function normalizeTimestamp(date: string | number) {
  if (typeof date === "number") {
    return new Date(date);
  }
  return new Date(date);
}

export function useUserData(
  types: DataType | DataType[],
  userId: string,
  limit: number
): UseUserDataReturn {
  const dispatch = useAppDispatch();
  const currentServer = useAppSelector(selectCurrentServer);
  const [{ loading, error, data }, setState] = useState<FetchState>({
    loading: true,
    error: null,
    data: [],
  });

  const typeArray = Array.isArray(types) ? types : [types];
  const typesKey = typeArray.join(",");

  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // 首先加载本地数据
      const localResults = await fetchUserData(typeArray, userId);
      const localData = Object.values(localResults).flat();

      setState((prev) => ({
        ...prev,
        data: localData,
        loading: true, // 保持loading状态因为还在获取远程数据
      }));

      logger.debug("Local data loaded", { count: localData.length });

      // 然后获取远程数据
      const remoteResults = await Promise.all(
        typeArray.map(async (type) => {
          const result = await noloQueryRequest({
            server: currentServer,
            queryUserId: userId,
            options: {
              isJSON: true,
              limit,
              condition: { type },
            },
          });
          return {
            type,
            data: await result.json(),
          };
        })
      );

      const uniqueMap = new Map();

      // 先添加本地数据
      localData.forEach((item) => {
        if (item?.id) {
          uniqueMap.set(item.id, item);
        }
      });

      // 合并远程数据
      remoteResults.forEach((result) => {
        const normalizedItems = normalizeRemoteData(result);
        normalizedItems.forEach((item) => {
          if (!item?.id) return;

          const existing = uniqueMap.get(item.id);
          if (!existing) {
            uniqueMap.set(item.id, item);
            return;
          }

          const existingDate = existing.updatedAt
            ? normalizeTimestamp(existing.updatedAt)
            : normalizeTimestamp(existing.created || "");

          const newDate = item.updatedAt
            ? normalizeTimestamp(item.updatedAt)
            : normalizeTimestamp(item.created || "");

          if (newDate > existingDate) {
            uniqueMap.set(item.id, item);
          }
        });
      });

      const mergedData = Array.from(uniqueMap.values());

      if (mergedData.length > 0) {
        dispatch(upsertMany(mergedData));
      }

      logger.debug("Remote data merged", { count: mergedData.length });

      setState({
        loading: false,
        error: null,
        data: mergedData,
      });
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred");
      logger.error("Failed to load user data", { error });
      setState((prev) => ({
        ...prev,
        loading: false,
        error,
      }));
    }
  }, [typesKey, userId, currentServer, limit, dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { loading, error, data, reload: loadData };
}
