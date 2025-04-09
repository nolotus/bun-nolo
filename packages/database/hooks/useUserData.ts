// database/hooks/useUserData.ts
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { pino } from "pino";
import { toast } from "react-hot-toast";
import { fetchUserData } from "../browser/fetchUserData"; // 确保路径正确
import { DataType } from "create/types"; // 确保路径正确
import { useAppSelector, useAppDispatch } from "app/hooks"; // 确保路径正确
import { selectCurrentServer } from "setting/settingSlice"; // 确保路径正确
import { noloQueryRequest } from "../client/queryRequest"; // 确保路径正确
import { upsertMany } from "database/dbSlice"; // 确保路径正确
import { useAuth } from "auth/hooks/useAuth"; // 确保路径正确

const logger = pino({ name: "useUserData" });

// 定义基础数据项接口
interface BaseItem {
  id: string;
  type: DataType;
  updatedAt?: string | number; // ISO 8601 字符串或时间戳
  created?: string | number; // ISO 8601 字符串或时间戳
  userId: string;
  [key: string]: any;
}

// 定义 Hook 的状态接口
interface FetchState {
  loading: boolean;
  error: Error | null;
  data: BaseItem[];
}

// 定义 Hook 的返回值接口
interface UseUserDataReturn extends FetchState {
  reload: () => Promise<void>;
  clearCache: () => void;
}

// 提取数据合并与去重逻辑
const mergeAndDedupData = (
  localData: BaseItem[],
  remoteResults: any[]
): BaseItem[] => {
  const uniqueMap = new Map<string, BaseItem>();

  // 辅助函数：将数据项添加到 Map 中，处理冲突
  const addToMap = (item: BaseItem) => {
    // 确保 item 和 item.id 有效
    if (!item?.id) {
      logger.warn(
        { item },
        "Skipping item due to missing id in mergeAndDedupData"
      );
      return;
    }

    const existing = uniqueMap.get(item.id);
    if (!existing) {
      uniqueMap.set(item.id, item);
      return;
    }

    // 比较更新时间，保留最新的记录
    // 优先使用 updatedAt，其次使用 created
    const getTimestamp = (dataItem: BaseItem): number => {
      const dateStrOrNum = dataItem.updatedAt ?? dataItem.created;
      if (!dateStrOrNum) return 0;
      try {
        // 尝试解析为日期对象，然后获取时间戳
        return new Date(dateStrOrNum).getTime();
      } catch (e) {
        // 如果解析失败（可能已经是时间戳数字），直接返回或返回0
        return typeof dateStrOrNum === "number" ? dateStrOrNum : 0;
      }
    };

    const existingTimestamp = getTimestamp(existing);
    const newTimestamp = getTimestamp(item);

    // 如果新项目的时间戳更新或有效，则替换旧项目
    // 注意：如果时间戳相同，后来的（可能是远程的）会覆盖本地的（如果它们ID相同）
    if (newTimestamp >= existingTimestamp) {
      uniqueMap.set(item.id, item);
    }
  };

  // 添加本地数据到 Map
  localData.forEach(addToMap);

  // 添加远程数据到 Map
  remoteResults.forEach((result) => {
    // 安全地访问嵌套数据，并确保是数组
    const items = result?.data?.data;
    if (Array.isArray(items)) {
      items.forEach(addToMap);
    } else if (items) {
      logger.warn({ resultData: items }, "Remote result data is not an array");
    }
  });

  // 返回 Map 中的所有值组成的数组
  return Array.from(uniqueMap.values());
};

/**
 * 自定义 Hook 用于获取、合并和管理用户相关的本地和远程数据。
 * @param types 要获取的数据类型或类型数组。
 * @param userId 要查询的用户 ID，或 "local" 表示仅本地（未登录时）或当前登录用户（登录时）。
 * @param limit 限制最终返回的数据条目数量。
 * @returns 包含加载状态、错误信息、数据、重新加载函数和清除缓存函数的对象。
 */
export function useUserData(
  types: DataType | DataType[],
  userId: string,
  limit: number // limit 参数用于限制最终返回数量
): UseUserDataReturn {
  const dispatch = useAppDispatch();
  const currentServer = useAppSelector(selectCurrentServer);
  const auth = useAuth(); // 获取认证信息

  // 使用 useState 管理加载状态、错误和数据
  const [{ loading, error, data }, setState] = useState<FetchState>({
    loading: true, // 初始状态为加载中
    error: null,
    data: [],
  });

  // 将 types 统一处理为数组
  const typeArray = useMemo(
    () => (Array.isArray(types) ? types : [types]),
    [types]
  );
  // 创建一个基于类型的 key，用于依赖比较
  const typesKey = useMemo(() => typeArray.join(","), [typeArray]);

  // 使用 ref 防止并发加载
  const loadingRef = useRef(false);
  // 使用 ref 存储上一次加载的参数，避免不必要的重复加载
  const previousParamsRef = useRef<{
    typesKey: string;
    userId: string;
    server: string | null;
  }>({
    typesKey: "",
    userId: "",
    server: null,
  });

  // 计算有效的用户 ID
  // 如果传入 userId 为 "local" 且用户已登录，则使用当前登录用户的 ID
  const effectiveUserId = useMemo(() => {
    if (userId === "local" && auth.isLoggedIn && auth.user?.id) {
      return auth.user.id;
    }
    // 否则使用传入的 userId (可能是具体ID，也可能是 "local" 但未登录)
    return userId;
  }, [userId, auth.isLoggedIn, auth.user?.id]);

  // 清除缓存的回调函数，重置 previousParamsRef
  const clearCache = useCallback(() => {
    previousParamsRef.current = { typesKey: "", userId: "", server: null };
    // 可选：立即设置为空数据和加载状态
    // setState({ loading: true, error: null, data: [] });
  }, []);

  // 主要的数据加载逻辑，使用 useCallback 优化
  const loadData = useCallback(async () => {
    // 构建当前请求的参数对象
    const currentParams = {
      typesKey,
      userId: effectiveUserId,
      server: currentServer, // 使用当前选择的服务器
    };

    // 如果正在加载，或者当前参数与上次相同，则不执行加载
    if (
      loadingRef.current ||
      JSON.stringify(previousParamsRef.current) ===
        JSON.stringify(currentParams)
    ) {
      logger.debug("Skipping loadData: already loading or params unchanged.");
      return;
    }

    // 标记为正在加载，并存储当前参数
    loadingRef.current = true;
    previousParamsRef.current = currentParams;
    // 更新状态为加载中，并清除之前的错误
    setState((prev) => ({ ...prev, loading: true, error: null }));
    logger.debug({ params: currentParams }, "Starting data load...");

    try {
      // 1. 获取本地数据 (不受 limit 限制)
      // 注意：如果 effectiveUserId 为 "local" 且未登录，fetchUserData 可能返回空或特定于本地未登录状态的数据
      const localResults = await fetchUserData(typeArray, effectiveUserId);
      const localData: BaseItem[] = Object.values(localResults).flat();
      logger.debug({ count: localData.length }, "Fetched local data");

      // 如果是纯本地用户（userId === "local"）且未登录，则只使用本地数据
      if (userId === "local" && !auth.isLoggedIn) {
        logger.debug("Local user not logged in, using only local data.");
        // 对本地数据也应用排序和限制
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
          return dateB - dateA; // 降序
        });
        const limitedLocalData = sortedLocalData.slice(0, limit);

        setState({
          loading: false,
          error: null,
          data: limitedLocalData, // 返回限制数量的本地数据
        });
        loadingRef.current = false; // 别忘了重置 loadingRef
        return; // 结束执行
      }

      // 如果用户已登录或指定了 userId，则先显示本地数据（可能超过 limit），同时加载远程数据
      // 对初始显示的本地数据也应用排序和限制，提供更好的即时反馈
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
        return dateB - dateA; // 降序
      });
      const limitedInitialLocalData = sortedInitialLocalData.slice(0, limit);

      setState((prev) => ({
        ...prev,
        // data: localData, // 旧：显示所有本地数据
        data: limitedInitialLocalData, // 新：显示限制数量的本地数据
        loading: true, // 保持加载状态，因为要去获取远程数据
      }));

      // 2. 获取远程数据 (对每个 type 应用 limit)
      logger.debug({ types: typeArray, limit }, "Fetching remote data...");
      const remoteResults = await Promise.all(
        typeArray.map(async (type) => {
          try {
            const response = await noloQueryRequest({
              server: currentServer, // 确保传递了服务器地址
              queryUserId: effectiveUserId, // 查询的用户 ID
              options: {
                isJSON: true,
                limit, // 在请求中包含 limit
                condition: { type }, // 查询条件为指定类型
              },
            });
            // 检查响应状态
            if (!response.ok) {
              logger.error(
                { status: response.status, type },
                "Remote query failed with status"
              );
              // 可以根据需要抛出错误或返回空结果
              // throw new Error(`Remote query for type ${type} failed with status ${response.status}`);
              return { data: { data: [] } }; // 返回空数据结构，避免 Promise.all 失败
            }
            return await response.json(); // 解析 JSON 响应
          } catch (error) {
            logger.error(
              { error, type },
              "Error fetching remote data for type"
            );
            // 返回空数据结构，让 Promise.all 继续
            return { data: { data: [] } };
          }
        })
      );
      logger.debug(
        {
          count: remoteResults.reduce(
            (sum, r) => sum + (r?.data?.data?.length || 0),
            0
          ),
        },
        "Fetched remote data"
      );

      // 3. 合并本地和远程数据 (结果可能超过 limit)
      const mergedData = mergeAndDedupData(localData, remoteResults);
      logger.debug(
        { count: mergedData.length },
        "Merged local and remote data"
      );

      // 4. 对合并后的数据进行排序和截断，确保最终结果符合 limit
      //    根据 updatedAt 或 created 降序排序 (最新的在前)
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
        return timestampB - timestampA; // 降序
      });

      //    截取前 limit 条数据
      const limitedData = sortedData.slice(0, limit);
      logger.debug(
        { count: limitedData.length },
        "Applied limit to merged data"
      );

      // 5. (可选，但推荐) 将合并后的完整数据 (mergedData) 更新到 Redux store
      //    这样可以缓存所有已知的数据，而不仅仅是限制后的数据
      if (mergedData.length > 0) {
        logger.debug(
          "Dispatching upsertMany to update Redux store with merged data"
        );
        dispatch(upsertMany(mergedData));
      }

      // 6. 更新 Hook 的状态，使用排序和截断后的数据 (limitedData)
      setState({
        loading: false, // 加载完成
        error: null,
        data: limitedData, // 返回给组件的数据是限制数量的
      });
      logger.debug("Data load finished successfully.");
    } catch (err) {
      // 处理加载过程中发生的任何错误
      const error =
        err instanceof Error
          ? err
          : new Error(String(err) || "Unknown error occurred");
      logger.error(
        { err: error, userId: effectiveUserId, types: typeArray },
        "Failed to load user data"
      );
      toast.error("加载数据失败，请检查网络或稍后重试"); // 用户友好的错误提示

      // 更新状态，标记加载失败并记录错误
      // 保留之前可能已加载的数据（截断后的），或者清空
      setState((prev) => ({
        ...prev,
        loading: false,
        error,
        // 可以选择保留截断后的旧数据：
        // data: prev.data.slice(0, limit),
        // 或者在出错时清空数据：
        // data: [],
      }));
    } finally {
      // 无论成功或失败，最终都要重置加载状态 ref
      loadingRef.current = false;
    }
  }, [
    // useCallback 的依赖数组，确保在这些值变化时重新创建 loadData 函数
    typesKey,
    effectiveUserId,
    currentServer,
    limit, // 确保 limit 是依赖项
    dispatch,
    auth.isLoggedIn, // 需要根据登录状态决定行为
    userId, // 原始的 userId 也需要，用于判断 "local" 场景
    typeArray, // 虽然 typesKey 包含了它，但明确列出有时更清晰
  ]);

  // 使用 useEffect 在组件挂载或 loadData 函数变化时执行数据加载
  useEffect(() => {
    logger.debug("useEffect triggered, calling loadData.");
    loadData();
  }, [loadData]); // 依赖于 useCallback 返回的 loadData 函数

  // 返回 Hook 的状态和控制函数
  return { loading, error, data, reload: loadData, clearCache };
}
