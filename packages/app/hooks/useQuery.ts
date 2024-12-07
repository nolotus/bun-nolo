import { useState } from "react";
import { selectCurrentServer, selectSyncServers } from "setting/settingSlice";
import { queryServer } from "database/dbSlice";
import { useAppDispatch } from "app/hooks";
import { useAppSelector } from "app/hooks";

export const useQuery = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const syncServers = useAppSelector(selectSyncServers); // 选择同步的服务器列表
  const currentServer = useAppSelector(selectCurrentServer); // 选择当前服务器
  const isAutoSync = useAppSelector(
    (state) => state.settings.syncSetting.isAutoSync // 选择是否开启自动同步
  );

  const fetchData = async (queryConfig) => {
    if (!queryConfig) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      const action = await dispatch(
        queryServer({ server: currentServer, ...queryConfig }) // 查询当前服务器
      );
      setIsSuccess(true);
      return action.payload;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
      if (isAutoSync) {
        // 如果开启了自动同步
        syncServers.forEach((server) => {
          dispatch(queryServer({ server, ...queryConfig })); // 对每个同步服务器执行查询
        });
      }
    }
  };

  return { fetchData, isLoading, error, isSuccess };
};
