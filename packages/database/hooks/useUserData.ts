import { useEffect, useState, useCallback } from "react";
import { fetchUserData } from "../browser/fetchUserData";
import { DataType } from "create/types";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { selectCurrentServer } from "setting/settingSlice";
import { noloQueryRequest } from "../client/queryRequest";
import { upsertMany } from "database/dbSlice";

export function useUserData(
  types: DataType | DataType[],
  userId: string,
  limit: number
) {
  const dispatch = useAppDispatch();
  const currentServer = useAppSelector(selectCurrentServer);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      const uniqueMap = new Map();

      // 处理本地数据
      typeArray.forEach((type) => {
        const localTypeData = localResults[type] || [];
        localTypeData.forEach((item) => {
          uniqueMap.set(item.id, item);
        });
      });

      // 处理远程数据
      remoteResults.forEach(({ data: remoteTypeData }) => {
        remoteTypeData.forEach((item) => {
          const existing = uniqueMap.get(item.id);
          if (
            !existing ||
            new Date(item.updatedAt) > new Date(existing.updatedAt)
          ) {
            uniqueMap.set(item.id, item);
          }
        });
      });

      const mergedData = Array.from(uniqueMap.values());
      dispatch(upsertMany(mergedData));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [typesKey, userId, currentServer, limit, dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { loading, error, reload: loadData };
}
