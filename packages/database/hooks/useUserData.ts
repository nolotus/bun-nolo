// database/hooks/useUserData.ts
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { pino } from "pino";
import { toast } from "react-hot-toast";
import { fetchUserData } from "../browser/fetchUserData";
import { DataType } from "create/types";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { selectCurrentServer } from "setting/settingSlice";
import { noloQueryRequest } from "../client/queryRequest";
import { upsertMany } from "database/dbSlice";
import { useAuth } from "auth/hooks/useAuth";

const logger = pino({ name: "useUserData" });

interface BaseItem {
  id: string;
  type: DataType;
  updatedAt?: string | number;
  created?: string | number;
  userId: string;
  [key: string]: any;
}

interface FetchState {
  loading: boolean;
  error: Error | null;
  data: BaseItem[];
}

interface UseUserDataReturn extends FetchState {
  reload: () => Promise<void>;
}

// 提取数据合并逻辑
const mergeAndDedupData = (localData: BaseItem[], remoteResults: any[]) => {
  const uniqueMap = new Map<string, BaseItem>();

  const addToMap = (item: BaseItem) => {
    if (!item?.id) return;

    const existing = uniqueMap.get(item.id);
    if (!existing) {
      uniqueMap.set(item.id, item);
      return;
    }

    const existingDate = existing.updatedAt
      ? new Date(existing.updatedAt)
      : new Date(existing.created || "");
    const newDate = item.updatedAt
      ? new Date(item.updatedAt)
      : new Date(item.created || "");

    if (newDate > existingDate) {
      uniqueMap.set(item.id, item);
    }
  };

  // 添加本地数据
  localData.forEach(addToMap);

  // 添加远程数据
  remoteResults.forEach((result) => {
    const items = result?.data?.data || [];
    items.forEach(addToMap);
  });

  return Array.from(uniqueMap.values());
};

export function useUserData(
  types: DataType | DataType[],
  userId: string,
  limit: number
): UseUserDataReturn {
  const dispatch = useAppDispatch();
  const currentServer = useAppSelector(selectCurrentServer);
  const auth = useAuth();
  const [{ loading, error, data }, setState] = useState<FetchState>({
    loading: true,
    error: null,
    data: [],
  });

  const typeArray = Array.isArray(types) ? types : [types];
  const typesKey = typeArray.join(",");

  const loadingRef = useRef(false);
  const previousParamsRef = useRef({ typesKey: "", userId: "", server: "" });

  const effectiveUserId = useMemo(() => {
    if (userId === "local" && auth.isLoggedIn && auth.user?.id) {
      return auth.user.id;
    }
    return userId;
  }, [userId, auth.isLoggedIn, auth.user?.id]);

  const loadData = useCallback(async () => {
    const currentParams = {
      typesKey,
      userId: effectiveUserId,
      server: currentServer,
    };

    if (
      loadingRef.current ||
      JSON.stringify(previousParamsRef.current) ===
        JSON.stringify(currentParams)
    ) {
      return;
    }

    loadingRef.current = true;
    previousParamsRef.current = currentParams;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // 获取本地数据
      const localResults = await fetchUserData(typeArray, effectiveUserId);
      const localData = Object.values(localResults).flat();

      // 仅本地用户且未登录时直接返回本地数据
      if (userId === "local" && !auth.isLoggedIn) {
        setState({
          loading: false,
          error: null,
          data: localData,
        });
        return;
      }

      // 显示本地数据同时加载远程数据
      setState((prev) => ({
        ...prev,
        data: localData,
        loading: true,
      }));

      // 获取远程数据
      const remoteResults = await Promise.all(
        typeArray.map((type) =>
          noloQueryRequest({
            server: currentServer,
            queryUserId: effectiveUserId,
            options: {
              isJSON: true,
              limit,
              condition: { type },
            },
          }).then((res) => res.json())
        )
      );

      // 合并数据并更新状态
      const mergedData = mergeAndDedupData(localData, remoteResults);

      if (mergedData.length > 0) {
        dispatch(upsertMany(mergedData));
      }

      setState({
        loading: false,
        error: null,
        data: mergedData,
      });
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred");
      logger.error(
        { err, userId: effectiveUserId, types: typeArray },
        "Failed to load user data"
      );
      toast.error("加载数据失败，请稍后重试");

      setState((prev) => ({
        ...prev,
        loading: false,
        error,
      }));
    } finally {
      loadingRef.current = false;
    }
  }, [
    typeArray,
    effectiveUserId,
    currentServer,
    limit,
    dispatch,
    auth.isLoggedIn,
    userId,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { loading, error, data, reload: loadData };
}
