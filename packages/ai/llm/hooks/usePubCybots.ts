// ai/hooks/usePubCybots.ts

import { useEffect, useState, useCallback } from "react";
import { Agent } from "app/types";
import { fetchPubCybots as fetchLocal } from "ai/cybot/web/fetchPubCybots";
import { useAppSelector } from "app/store";
import { selectCurrentServer } from "app/settings/settingSlice";
import { useDispatch } from "react-redux";
import { remove } from "database/dbSlice";

interface UsePubCybotsOptions {
  limit?: number;
  sortBy?: "newest" | "popular" | "rating";
}

interface PubCybotsState {
  loading: boolean;
  error: Error | null;
  data: Agent[];
}

function mergeCybots(localData: Agent[], remoteData: Agent[]): MergeResult {
  // 创建远程数据的id集合用于快速查找
  const remoteIds = new Set(remoteData.map((bot) => bot.id));

  // 最终结果数组
  let merged: Agent[] = [];
  // 需要删除的本地bot id
  let toDelete: string[] = [];

  // 遍历本地数据
  localData.forEach((localBot) => {
    if (remoteIds.has(localBot.id)) {
      // 如果远程也有这个bot,保留本地的
      merged.push(localBot);
    } else {
      // 如果远程没有,加入待删除列表
      toDelete.push(localBot.id);
    }
  });

  // 添加远程独有的
  remoteData.forEach((remoteBot) => {
    if (!merged.some((bot) => bot.id === remoteBot.id)) {
      merged.push(remoteBot);
    }
  });

  // 按时间排序
  merged.sort((a, b) => {
    const timeA =
      typeof a.createdAt === "string" ? Date.parse(a.createdAt) : a.createdAt;
    const timeB =
      typeof b.createdAt === "string" ? Date.parse(b.createdAt) : b.createdAt;
    return timeB - timeA;
  });

  return {
    merged,
    toDelete,
  };
}

async function fetchRemoteCybots(
  currentServer: string,
  limit: number,
  sortBy: string
) {
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

  return response.json();
}

export function usePubCybots({
  limit = 20,
  sortBy = "newest",
}: UsePubCybotsOptions = {}) {
  const currentServer = useAppSelector(selectCurrentServer);
  const dispatch = useDispatch();
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
        const remoteResult = await fetchRemoteCybots(
          currentServer,
          limit,
          sortBy
        );

        const { merged, toDelete } = mergeCybots(
          localResult.data,
          remoteResult.data
        );

        // TODO: 改为批量同时删除,提高性能
        toDelete.forEach((id) => {
          dispatch(remove(id));
        });

        setState({
          loading: false,
          error: null,
          data: merged,
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
  }, [limit, sortBy, currentServer, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const retry = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetchData();
  }, [fetchData]);

  return { ...state, retry };
}
