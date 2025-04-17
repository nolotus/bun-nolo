// database/hooks/useUserData.ts
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { toast } from "react-hot-toast";
import { fetchUserData } from "../browser/fetchUserData";
import { DataType } from "create/types";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { selectCurrentServer } from "setting/settingSlice";
import { noloQueryRequest } from "../client/queryRequest";
import { upsertMany } from "database/dbSlice";
import { useAuth } from "auth/hooks/useAuth";

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
  clearCache: () => void;
}

const mergeAndDedupData = (
  localData: BaseItem[],
  remoteResults: any[]
): BaseItem[] => {
  const uniqueMap = new Map<string, BaseItem>();

  const addToMap = (item: BaseItem) => {
    if (!item?.id) {
      return;
    }

    const existing = uniqueMap.get(item.id);
    if (!existing) {
      uniqueMap.set(item.id, item);
      return;
    }

    const getTimestamp = (dataItem: BaseItem): number => {
      const dateStrOrNum = dataItem.updatedAt ?? dataItem.created;
      if (!dateStrOrNum) return 0;
      try {
        return new Date(dateStrOrNum).getTime();
      } catch (e) {
        return typeof dateStrOrNum === "number" ? dateStrOrNum : 0;
      }
    };

    const existingTimestamp = getTimestamp(existing);
    const newTimestamp = getTimestamp(item);

    if (newTimestamp >= existingTimestamp) {
      uniqueMap.set(item.id, item);
    }
  };

  localData.forEach(addToMap);
  remoteResults.forEach((result) => {
    const items = result?.data?.data;
    if (Array.isArray(items)) {
      items.forEach(addToMap);
    }
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

  const typeArray = useMemo(
    () => (Array.isArray(types) ? types : [types]),
    [types]
  );
  const typesKey = useMemo(() => typeArray.join(","), [typeArray]);

  const loadingRef = useRef(false);
  const previousParamsRef = useRef<{
    typesKey: string;
    userId: string;
    server: string | null;
  }>({
    typesKey: "",
    userId: "",
    server: null,
  });

  const effectiveUserId = useMemo(() => {
    if (userId === "local" && auth.isLoggedIn && auth.user?.id) {
      return auth.user.id;
    }
    return userId;
  }, [userId, auth.isLoggedIn, auth.user?.id]);

  const clearCache = useCallback(() => {
    previousParamsRef.current = { typesKey: "", userId: "", server: null };
  }, []);

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
      const localResults = await fetchUserData(typeArray, effectiveUserId);
      const localData: BaseItem[] = Object.values(localResults).flat();

      if (userId === "local" && !auth.isLoggedIn) {
        const sortedLocalData = [...localData].sort((a, b) => {
          const dateA = a.updatedAt
            ? new Date(a.updatedAt).getTime()
            : a.created
              ? new Date(a.created).getTime()
              : 0;
          const dateB = b.updatedAt
            ? new Date(b.updatedAt).getTime()
            : b.created
              ? new Date(b.created).getTime()
              : 0;
          return dateB - dateA;
        });
        const limitedLocalData = sortedLocalData.slice(0, limit);

        setState({
          loading: false,
          error: null,
          data: limitedLocalData,
        });
        loadingRef.current = false;
        return;
      }

      const sortedInitialLocalData = [...localData].sort((a, b) => {
        const dateA = a.updatedAt
          ? new Date(a.updatedAt).getTime()
          : a.created
            ? new Date(a.created).getTime()
            : 0;
        const dateB = b.updatedAt
          ? new Date(b.updatedAt).getTime()
          : b.created
            ? new Date(b.created).getTime()
            : 0;
        return dateB - dateA;
      });
      const limitedInitialLocalData = sortedInitialLocalData.slice(0, limit);
      setState((prev) => ({
        ...prev,
        data: limitedInitialLocalData,
        loading: true,
      }));

      const remoteResults = await Promise.all(
        typeArray.map(async (type) => {
          try {
            const response = await noloQueryRequest({
              server: currentServer,
              queryUserId: effectiveUserId,
              options: {
                limit,
                condition: { type },
              },
            });
            if (!response.ok) {
              return { data: { data: [] } };
            }
            const data = await response.json();
            return data;
          } catch (error) {
            return { data: { data: [] } };
          }
        })
      );

      const mergedData = mergeAndDedupData(localData, remoteResults);
      const sortedData = [...mergedData].sort((a, b) => {
        const getTimestamp = (dataItem: BaseItem): number => {
          const dateStrOrNum = dataItem.updatedAt ?? dataItem.created;
          if (!dateStrOrNum) return 0;
          try {
            return new Date(dateStrOrNum).getTime();
          } catch (e) {
            return typeof dateStrOrNum === "number" ? dateStrOrNum : 0;
          }
        };
        const timestampA = getTimestamp(a);
        const timestampB = getTimestamp(b);
        return timestampB - timestampA;
      });
      const limitedData = sortedData.slice(0, limit);

      if (mergedData.length > 0) {
        dispatch(upsertMany(mergedData));
      }

      setState({
        loading: false,
        error: null,
        data: limitedData,
      });
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error(String(err) || "Unknown error occurred");
      toast.error("加载数据失败，请检查网络或稍后重试");

      setState((prev) => ({
        ...prev,
        loading: false,
        error,
      }));
    } finally {
      loadingRef.current = false;
    }
  }, [
    typesKey,
    effectiveUserId,
    currentServer,
    limit,
    dispatch,
    auth.isLoggedIn,
    userId,
    typeArray,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { loading, error, data, reload: loadData, clearCache };
}
