import { useEffect, useState, useCallback } from "react";
import { fetchUserData } from "../browser/fetchUserData";
import { DataType } from "create/types";
import { useAppSelector } from "app/hooks";
import { selectCurrentServer } from "setting/settingSlice";
import { noloQueryRequest } from "../client/queryRequest";

export function useUserData(type, userId, limit) {
  const curretnServer = useAppSelector(selectCurrentServer);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 将加载数据逻辑抽取为可复用的函数
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const localResults = await fetchUserData(type, userId);

      const result = await noloQueryRequest({
        server: curretnServer,
        queryUserId: userId,
        options: {
          isJSON: true,
          limit,
          condition: {
            type: DataType.Cybot,
          },
        },
      });
      const remoteData = await result.json();

      const mergedData = [...localResults, ...remoteData];
      setData(mergedData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [type, userId, curretnServer, limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    reload: loadData, // 暴露重新加载数据的方法
  };
}
