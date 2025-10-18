import { useEffect, useState, useCallback } from "react";
import { Agent } from "app/types";
import { fetchPublicAgents as fetchLocal } from "ai/agent/web/fetchPublicAgents";
import { useAppSelector } from "app/store";
import { selectCurrentServer } from "app/settings/settingSlice";
import { useDispatch } from "react-redux";
import { remove } from "database/dbSlice";

export interface UsePublicAgentsOptions {
  limit?: number;
  sortBy?:
    | "newest"
    | "popular"
    | "rating"
    | "outputPriceAsc"
    | "outputPriceDesc";
  searchName?: string;
}

interface PublicAgentsState {
  loading: boolean;
  error: Error | null;
  data: Agent[];
}

interface MergeResult {
  merged: Agent[];
  toDelete: string[];
}

// [修复 1] 创建一个可复用的排序函数，逻辑与 fetcher 中保持一致
const sortAgents = (
  agents: Agent[],
  sortBy: UsePublicAgentsOptions["sortBy"]
): Agent[] => {
  const sortedAgents = [...agents]; // 创建副本以避免直接修改 state
  sortedAgents.sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return (b.metrics?.useCount ?? 0) - (a.metrics?.useCount ?? 0);
      case "rating":
        return (b.metrics?.rating ?? 0) - (a.metrics?.rating ?? 0);
      case "outputPriceAsc":
        const priceA_asc = parseFloat(String(a.outputPrice)) || Infinity;
        const priceB_asc = parseFloat(String(b.outputPrice)) || Infinity;
        return priceA_asc - priceB_asc;
      case "outputPriceDesc":
        const priceA_desc = parseFloat(String(a.outputPrice)) || -Infinity;
        const priceB_desc = parseFloat(String(b.outputPrice)) || -Infinity;
        return priceB_desc - priceA_desc;
      case "newest":
      default:
        const timeA =
          typeof a.createdAt === "string"
            ? Date.parse(a.createdAt)
            : a.createdAt;
        const timeB =
          typeof b.createdAt === "string"
            ? Date.parse(b.createdAt)
            : b.createdAt;
        return timeB - timeA;
    }
  });
  return sortedAgents;
};

// [修复 2] mergeAgents 函数现在只负责合并，不再进行任何排序
function mergeAgents(localData: Agent[], remoteData: Agent[]): MergeResult {
  const remoteIds = new Set(remoteData.map((agent) => agent.id));
  const merged: Agent[] = [];
  const toDelete: string[] = [];

  localData.forEach((localAgent) => {
    if (remoteIds.has(localAgent.id)) {
      merged.push(localAgent);
    } else {
      toDelete.push(localAgent.id);
    }
  });

  remoteData.forEach((remoteAgent) => {
    if (!merged.some((agent) => agent.id === remoteAgent.id)) {
      merged.push(remoteAgent);
    }
  });

  // 移除了错误的、写死的排序逻辑
  return { merged, toDelete };
}

async function fetchRemoteAgents(
  currentServer: string,
  options: UsePublicAgentsOptions
) {
  const response = await fetch(`${currentServer}/rpc/getPublicAgents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    throw new Error(`Remote fetch failed with status ${response.status}`);
  }
  return response.json();
}

export function usePublicAgents({
  limit = 20,
  sortBy = "newest",
  searchName = "",
}: UsePublicAgentsOptions = {}) {
  const currentServer = useAppSelector(selectCurrentServer);
  const dispatch = useDispatch();
  const [state, setState] = useState<PublicAgentsState>({
    loading: true,
    error: null,
    data: [],
  });

  const fetchData = useCallback(async () => {
    const options = { limit, sortBy, searchName };

    if (!currentServer) {
      try {
        const localResult = await fetchLocal(options);
        // 本地模式下，fetchLocal 返回的数据已经排好序
        setState({ loading: false, error: null, data: localResult.data });
      } catch (err) {
        setState({
          loading: false,
          error:
            err instanceof Error
              ? err
              : new Error("Failed to fetch local agents"),
          data: [],
        });
      }
      return;
    }

    try {
      const localResult = await fetchLocal(options);
      setState((prev) => ({ ...prev, loading: true, data: localResult.data }));

      try {
        const remoteResult = await fetchRemoteAgents(currentServer, options);

        // 合并本地和远程数据（此时是未排序的）
        const { merged, toDelete } = mergeAgents(
          localResult.data,
          remoteResult.data
        );

        // [修复 3] 在数据合并后，使用正确的 sortBy 选项进行最终排序
        const finalSortedData = sortAgents(merged, sortBy);

        toDelete.forEach((id) => {
          dispatch(remove(id));
        });

        // 将最终排好序的数据设置到 state 中
        setState({ loading: false, error: null, data: finalSortedData });
      } catch (err) {
        setState((prev) => ({ ...prev, loading: false, error: null }));
      }
    } catch (err) {
      setState({
        loading: false,
        error: err instanceof Error ? err : new Error("Failed to fetch agents"),
        data: [],
      });
    }
  }, [limit, sortBy, searchName, currentServer, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const retry = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetchData();
  }, [fetchData]);

  return { ...state, retry };
}
