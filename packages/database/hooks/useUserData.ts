import { useEffect, useState, useCallback } from "react";
import { fetchUserData } from "../browser/fetchUserData";
import { DataType } from "create/types";
import { useAppSelector } from "app/hooks";
import { selectCurrentServer } from "setting/settingSlice";
import { noloQueryRequest } from "../client/queryRequest";

export function useUserData(
  types: DataType | DataType[],
  userId: string,
  limit: number
) {
  const currentServer = useAppSelector(selectCurrentServer);
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 将types转换为字符串来比较，避免数组引用变化
  const typesKey = Array.isArray(types) ? types.join(",") : types;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const typeArray = Array.isArray(types) ? types : [types];
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

      // 修改mergedData部分的逻辑，使用updatedAt来决定保留哪条数据
      if (Array.isArray(types)) {
        const mergedData = typeArray.reduce((acc, type) => {
          const uniqueMap = new Map();
          const localTypeData = localResults[type] || [];
          const remoteTypeData =
            remoteResults.find((r) => r.type === type)?.data || [];

          [...localTypeData, ...remoteTypeData].forEach((item) => {
            const existing = uniqueMap.get(item.id);
            if (
              !existing ||
              new Date(item.updatedAt) > new Date(existing.updatedAt)
            ) {
              uniqueMap.set(item.id, item);
            }
          });

          acc[type] = Array.from(uniqueMap.values());
          return acc;
        }, {});

        setData(mergedData);
      } else {
        const uniqueMap = new Map();
        const localTypeData = localResults[types] || [];
        const remoteTypeData = remoteResults[0]?.data || [];

        [...localTypeData, ...remoteTypeData].forEach((item) => {
          const existing = uniqueMap.get(item.id);
          if (
            !existing ||
            new Date(item.updatedAt) > new Date(existing.updatedAt)
          ) {
            uniqueMap.set(item.id, item);
          }
        });

        setData(Array.from(uniqueMap.values()));
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [typesKey, userId, currentServer, limit]); // 使用typesKey替代types

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, reload: loadData };
}
