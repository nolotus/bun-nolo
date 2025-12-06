// ai/agent/hooks/usePublicAgents.ts
import { useEffect, useState, useCallback, useRef } from "react";
import { Agent } from "app/types";
import { fetchPublicAgents as fetchLocal } from "ai/agent/web/fetchPublicAgents";
import { useAppSelector } from "app/store";
import { selectCurrentServer } from "app/settings/settingSlice";
import { useDispatch } from "react-redux";
import { remove } from "database/dbSlice";
import { SERVERS } from "database/requests";

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

/**
 * 最低投入档——误删抑制开关
 * 1) 仅在“无搜索”时删除
 * 2) 且仅在“最新排序”时删除
 * 3) 删除判断时放大远程 limit（不影响 UI 展示），让差集更接近真实全集
 * 4) 仅删除 origin 属于 remote/both 的条目（若本地无此标记，沿用旧行为）
 */
const PRUNE_ONLY_WHEN_NO_SEARCH = true;
const PRUNE_ONLY_WHEN_SORT_NEWEST = true;
const PRUNE_LIMIT_MULTIPLIER = 5; // 用于差集删除的远程 limit 倍数
const PRUNE_LIMIT_CAP = 500; // 差集删除时远程 limit 上限
// 可选：软删除（最低投入档默认关闭，避免需要额外的 dbSlice 逻辑）
// const ENABLE_SOFT_DELETE = false;

/******** 工具函数 ********/
function toNumber(n: unknown, fallback: number) {
  const v = typeof n === "number" ? n : parseFloat(String(n));
  return Number.isFinite(v) ? v : fallback;
}

function toTimeMs(t: unknown) {
  if (typeof t === "number") return t;
  const n = Date.parse(String(t ?? 0));
  return Number.isFinite(n) ? n : 0;
}

/* 排序辅助元信息，统一口径避免抖动 */
type SortMeta = {
  createdAtMs: number;
  outputPriceNum: number;
  useCount: number;
  rating: number;
};
type MAgent = Agent & { __sort?: SortMeta };

// 根据本地与远程条目构建排序元信息：
// - 时间取更“新”（max(updatedAt/createdAt)）
// - 价格远程优先，失败取本地
// - 人气/评分做字段口径兼容
function buildSortMeta(local?: Agent, remote?: Agent): SortMeta {
  const createdAtMs = Math.max(
    toTimeMs(remote?.updatedAt ?? remote?.createdAt),
    toTimeMs(local?.updatedAt ?? local?.createdAt)
  );

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

/* 稳定排序（相等时按 id 稳定） */
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

/******** 合并 + 差集删除计算 ********/
/**
 * - 本地优先：同 id 用本地对象承载
 * - 合并时为每条记录计算 __sort
 * - toDelete: “本地有但远程本次结果里没有”的 id（用于删除本地缓存）
 */
function mergeAgents(localData: Agent[], remoteData: Agent[]) {
  const remoteIdSet = new Set(remoteData.map((a) => String(a.id)));
  const merged: MAgent[] = [];
  const toDelete: string[] = [];

  // 先放本地（本地优先）
  for (const local of localData) {
    const id = String(local.id);
    const remote = remoteIdSet.has(id)
      ? remoteData.find((r) => String(r.id) === id)
      : undefined;

    if (remote) {
      merged.push({
        ...(remote as any),
        ...(local as any),
        __sort: buildSortMeta(local, remote),
      });
    } else {
      // 远程本次未出现 → 进入待删集合（按最低投入策略，后续还要再判定场景）
      toDelete.push(id);
      merged.push({
        ...(local as any),
        __sort: buildSortMeta(local, undefined),
      });
    }
  }

  // 再补仅远程有的（新增）
  for (const r of remoteData) {
    const id = String(r.id);
    const exists = merged.some((m) => String(m.id) === id);
    if (!exists) {
      merged.push({ ...(r as any), __sort: buildSortMeta(undefined, r) });
    }
  }

  return { merged, toDelete };
}

/******** 远程获取（支持 Abort） ********/
async function fetchRemoteAgents(
  serverUrl: string,
  options: UsePublicAgentsOptions,
  signal?: AbortSignal
) {
  const response = await fetch(`${serverUrl}/rpc/getPublicAgents`, {
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
  const dispatch = useDispatch();

  const [state, setState] = useState<PublicAgentsState>({
    loading: true,
    error: null,
    data: [],
  });

  // 并发控制
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    const uiOptions = { limit, sortBy, searchName };
    const myReqId = ++requestIdRef.current;

    // 进入 loading，但保留现有数据，减少闪烁
    setState((prev) => ({ ...prev, loading: true, error: null }));

    // 1) 本地优先：先渲染本地（已排序）
    let localResult: { data: Agent[] } = { data: [] };
    try {
      localResult = await fetchLocal(uiOptions);
      if (myReqId !== requestIdRef.current) return;
      const localDecorated = localResult.data.map((a) => ({
        ...(a as any),
        __sort: buildSortMeta(a, undefined),
      }));
      const localSorted = sortAgents(localDecorated, sortBy).slice(0, limit);
      setState((prev) => ({ ...prev, data: localSorted }));
    } catch {
      // 本地失败不阻塞
    }

    // 2) 组装远程服务器列表（currentServer + SERVERS，去重）
    const serverSet = new Set<string>();

    if (currentServer) {
      serverSet.add(String(currentServer).replace(/\/+$/, ""));
    }

    if (SERVERS && typeof SERVERS === "object") {
      Object.values(SERVERS).forEach((url) => {
        if (url) {
          serverSet.add(String(url).replace(/\/+$/, ""));
        }
      });
    }

    const servers = Array.from(serverSet);

    // 若没有任何可用远程，则结束
    if (servers.length === 0) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    // 3) 远程稍后：成功后合并 + 条件化删除（对多个服务器并发）
    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      // 差集删除时使用更大的远程 limit，但 UI 仍按原 limit 展示
      const pruneLimit = Math.min(
        PRUNE_LIMIT_CAP,
        Math.max(limit, limit * PRUNE_LIMIT_MULTIPLIER)
      );
      const remoteOptions: UsePublicAgentsOptions = {
        ...uiOptions,
        limit: pruneLimit,
      };

      // 并发请求多个服务器，单个失败不影响整体
      const remoteResults = await Promise.allSettled(
        servers.map((server) =>
          fetchRemoteAgents(server, remoteOptions, abortRef.current!.signal)
        )
      );

      if (myReqId !== requestIdRef.current) return;

      // 合并多个服务器返回的数据，并按 id 去重
      const remoteMap = new Map<string, Agent>();

      remoteResults.forEach((res) => {
        if (res.status !== "fulfilled") return;
        const result = res.value as { data?: Agent[] };
        const list: Agent[] = result?.data ?? [];
        for (const agent of list) {
          const id = String(agent.id);
          // 若需要某个 server 优先，可在这里加优先级判断
          if (!remoteMap.has(id)) {
            remoteMap.set(id, agent);
          }
        }
      });

      const remoteData: Agent[] = Array.from(remoteMap.values());

      const { merged, toDelete } = mergeAgents(
        localResult.data ?? [],
        remoteData
      );

      // 先在本次渲染中过滤掉候选删除项，确保远程已下线的项不被展示
      const toDeleteSet = new Set(toDelete);
      const filteredForUI = (merged as Agent[]).filter(
        (a) => !toDeleteSet.has(String(a.id))
      );
      const finalSorted = sortAgents(filteredForUI, sortBy).slice(0, limit);

      // 是否执行本地物理删除（最低投入策略：仅无搜索+最新排序时删）
      const canPruneScene =
        (!PRUNE_ONLY_WHEN_NO_SEARCH || !searchName) &&
        (!PRUNE_ONLY_WHEN_SORT_NEWEST || sortBy === "newest");

      if (
        canPruneScene &&
        toDelete.length > 0 &&
        myReqId === requestIdRef.current
      ) {
        // 仅删除 origin 属于 remote/both 的条目；没有 origin 标记则按旧行为删除
        const toDeleteFiltered = toDelete.filter((id) => {
          const localItem = localResult.data.find(
            (a) => String(a.id) === id
          ) as any;
          const origin = localItem?.meta?.origin; // "remote" | "local" | "both" | undefined
          if (origin === "local") return false; // 明确是本地创建的，不删
          return true; // remote/both/undefined 都删（保持旧容忍度）
        });

        // 若启用软删除，这里可改为标记 stale；最低投入档默认直接删
        toDeleteFiltered.forEach((id) => dispatch(remove(id)));
      }

      if (myReqId !== requestIdRef.current) return;
      setState({ loading: false, error: null, data: finalSorted });
    } catch (err: any) {
      if (err?.name === "AbortError") return; // 被新请求中断
      if (myReqId !== requestIdRef.current) return;
      // 远程失败：保留本地阶段结果
      setState((prev) => ({ ...prev, loading: false, error: null }));
    }
  }, [limit, sortBy, searchName, currentServer, dispatch]);

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
