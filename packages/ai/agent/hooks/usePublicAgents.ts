import { useEffect, useState, useCallback, useRef } from "react";
import { Agent } from "app/types";
import { fetchPublicAgents as fetchLocal } from "ai/agent/web/fetchPublicAgents";
import { useAppSelector } from "app/store";
import { selectCurrentServer } from "app/settings/settingSlice";

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

// —— 工具函数 —— //
function toNumber(n: unknown, fallback: number) {
  const v = typeof n === "number" ? n : parseFloat(String(n));
  return Number.isFinite(v) ? v : fallback;
}

function toTimeMs(t: unknown) {
  if (typeof t === "number") return t;
  const n = Date.parse(String(t ?? 0));
  return Number.isFinite(n) ? n : 0;
}

type SortMeta = {
  createdAtMs: number; // 用于 newest
  outputPriceNum: number; // 用于价格排序
  useCount: number; // 用于 popular
  rating: number; // 用于 rating
};

type MAgent = Agent & { __sort?: SortMeta };

// 根据本地与远程条目构建排序元信息：优先使用远程值，若远程缺失则取本地；时间取两者较新。
function buildSortMeta(local?: Agent, remote?: Agent): SortMeta {
  const createdAtMs = Math.max(
    toTimeMs(remote?.updatedAt ?? remote?.createdAt),
    toTimeMs(local?.updatedAt ?? local?.createdAt)
  );

  // 价格：远程优先，其次本地；解析失败给 Infinity（升序时落后、降序时再特殊处理）
  const priceRemote = toNumber(
    (remote as any)?.outputPrice,
    Number.POSITIVE_INFINITY
  );
  const priceLocal = toNumber(
    (local as any)?.outputPrice,
    Number.POSITIVE_INFINITY
  );
  const outputPriceNum = Number.isFinite(priceRemote)
    ? priceRemote
    : priceLocal;

  // 人气/评分：统一口径
  const useCount =
    toNumber((remote as any)?.metrics?.useCount, NaN) ??
    toNumber((local as any)?.metrics?.useCount, NaN) ??
    toNumber((local as any)?.dialogCount, 0);

  const rating =
    toNumber((remote as any)?.metrics?.rating, NaN) ??
    toNumber((local as any)?.metrics?.rating, NaN) ??
    toNumber((local as any)?.messageCount, 0);

  return {
    createdAtMs,
    outputPriceNum: Number.isFinite(outputPriceNum)
      ? outputPriceNum
      : Number.POSITIVE_INFINITY,
    useCount: Number.isFinite(useCount) ? useCount : 0,
    rating: Number.isFinite(rating) ? rating : 0,
  };
}

// 稳定排序：先按 sortBy，比不出结果再按 id 稳定
const sortAgents = (
  agents: Agent[],
  sortBy: UsePublicAgentsOptions["sortBy"]
): Agent[] => {
  const arr = [...agents] as MAgent[];
  arr.sort((a, b) => {
    const sa = (a as MAgent).__sort;
    const sb = (b as MAgent).__sort;

    let diff = 0;
    switch (sortBy) {
      case "popular":
        diff = (sb?.useCount ?? 0) - (sa?.useCount ?? 0);
        break;
      case "rating":
        diff = (sb?.rating ?? 0) - (sa?.rating ?? 0);
        break;
      case "outputPriceAsc": {
        const pa = sa?.outputPriceNum ?? Number.POSITIVE_INFINITY;
        const pb = sb?.outputPriceNum ?? Number.POSITIVE_INFINITY;
        diff = pa - pb;
        break;
      }
      case "outputPriceDesc": {
        const pa = sa?.outputPriceNum ?? Number.NEGATIVE_INFINITY;
        const pb = sb?.outputPriceNum ?? Number.NEGATIVE_INFINITY;
        diff = pb - pa;
        break;
      }
      case "newest":
      default:
        diff = (sb?.createdAtMs ?? 0) - (sa?.createdAtMs ?? 0);
        break;
    }
    if (diff !== 0) return diff;
    return String(a.id).localeCompare(String(b.id));
  });
  return arr;
};

// “本地优先、远程稍后”的合并：
// - 同 id：展示以本地为准（本地对象覆盖远程对象），但 __sort 采用两者信息（时间取更近，数值优先远程）。
// - 远程新增：直接加入。
// - 不删除本地中远程不存在的条目（你要求“都要”）。
function mergeAgents(localData: Agent[], remoteData: Agent[]): Agent[] {
  const remoteMap = new Map<string, Agent>();
  for (const r of remoteData) remoteMap.set(String(r.id), r);

  const merged: MAgent[] = [];

  // 先放本地（本地优先）
  for (const local of localData) {
    const rid = String(local.id);
    const remote = remoteMap.get(rid);
    if (remote) {
      const meta = buildSortMeta(local, remote);
      // 展示以本地为准，但带上排序元信息
      const mergedItem: MAgent = {
        ...(remote as any),
        ...(local as any),
        __sort: meta,
      };
      merged.push(mergedItem);
      remoteMap.delete(rid);
    } else {
      const meta = buildSortMeta(local, undefined);
      const mergedItem: MAgent = { ...(local as any), __sort: meta };
      merged.push(mergedItem);
    }
  }

  // 再把仅远程有的补上
  for (const [, remote] of remoteMap) {
    const meta = buildSortMeta(undefined, remote);
    const mergedItem: MAgent = { ...(remote as any), __sort: meta };
    merged.push(mergedItem);
  }

  return merged;
}

// 远程获取（支持 Abort）
async function fetchRemoteAgents(
  currentServer: string,
  options: UsePublicAgentsOptions,
  signal?: AbortSignal
) {
  const response = await fetch(`${currentServer}/rpc/getPublicAgents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
    signal,
  });
  if (!response.ok)
    throw new Error(`Remote fetch failed with status ${response.status}`);
  return response.json();
}

export function usePublicAgents({
  limit = 20,
  sortBy = "newest",
  searchName = "",
}: UsePublicAgentsOptions = {}) {
  const currentServer = useAppSelector(selectCurrentServer);

  const [state, setState] = useState<PublicAgentsState>({
    loading: true,
    error: null,
    data: [],
  });

  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    const options = { limit, sortBy, searchName };
    const myReqId = ++requestIdRef.current;

    // 先进入 loading，但保留现有 data，减少闪烁
    setState((prev) => ({ ...prev, loading: true, error: null }));

    // 1) 立即拉本地并展示（本地优先）
    let localResult: { data: Agent[] } = { data: [] };
    try {
      localResult = await fetchLocal(options);
      if (myReqId !== requestIdRef.current) return;
      // 本地阶段也做“临时 __sort”，保证排序正确
      const localDecorated = localResult.data.map((a) => {
        const m: MAgent = {
          ...(a as any),
          __sort: buildSortMeta(a, undefined),
        };
        return m;
      });
      const localSorted = sortAgents(localDecorated, sortBy).slice(0, limit);
      setState((prev) => ({ ...prev, data: localSorted }));
    } catch {
      // 本地失败也不阻塞，继续远程
    }

    // 如果没有远程服务器，结束
    if (!currentServer) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    // 2) 发起远程，请求并合并（远程稍后）
    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const remoteResult = await fetchRemoteAgents(
        currentServer,
        options,
        abortRef.current.signal
      );
      if (myReqId !== requestIdRef.current) return;

      const merged = mergeAgents(
        localResult.data ?? [],
        remoteResult.data ?? []
      );
      const finalSorted = sortAgents(merged, sortBy).slice(0, limit);

      setState({ loading: false, error: null, data: finalSorted });
    } catch (err: any) {
      if (err?.name === "AbortError") return; // 被新请求中止
      if (myReqId !== requestIdRef.current) return;
      // 远程失败：保留本地阶段的结果
      setState((prev) => ({ ...prev, loading: false, error: null }));
    }
  }, [limit, sortBy, searchName, currentServer]);

  useEffect(() => {
    fetchData();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchData]);

  const retry = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetchData();
  }, [fetchData]);

  return { ...state, retry };
}
