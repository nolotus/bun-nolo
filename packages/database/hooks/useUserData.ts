// database/hooks/useUserData.ts

import { useEffect, useState, useCallback } from "react";
import { fetchUserData } from "../browser/fetchUserData";
import { DataType } from "create/types";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { selectCurrentServer } from "setting/settingSlice";
import { noloQueryRequest } from "../client/queryRequest";
import { upsertMany } from "database/dbSlice";

interface FetchState {
  loading: boolean;
  error: Error | null;
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
  const [{ loading, error }, setState] = useState<FetchState>({
    loading: true,
    error: null,
  });

  const typeArray = Array.isArray(types) ? types : [types];
  const typesKey = typeArray.join(",");

  const loadData = useCallback(async () => {
    setState({ loading: true, error: null });

    try {
      const localResults = await fetchUserData(typeArray, userId);
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

      Object.entries(localResults).forEach(([type, items]) => {
        (items as any[]).forEach((item) => {
          if (item?.id) {
            uniqueMap.set(item.id, item);
          }
        });
      });

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

      setState({ loading: false, error: null });
    } catch (err) {
      setState({
        loading: false,
        error: err instanceof Error ? err : new Error("Unknown error occurred"),
      });
    }
  }, [typesKey, userId, currentServer, limit, dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { loading, error, reload: loadData };
}
