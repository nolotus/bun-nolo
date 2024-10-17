import { useState, useEffect } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import { queryServer, selectById, read } from "database/dbSlice";
import { selectCurrentServer, selectSyncServers } from "setting/settingSlice";

import type { AppDispatch, NoloRootState } from "./store";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<NoloRootState> = useSelector;

export const useItem = (id: string) => {
  return useAppSelector((state: NoloRootState) => selectById(state, id));
};
export function useFetchData(id: string, options?: any) {
  const source = options?.source;
  const forceUpdate = options?.forceUpdate;
  const memdata = useAppSelector((state) => selectById(state, id));
  const dispatch = useDispatch();

  const [isLoading, setLoading] = useState(false);

  const [error, setError] = useState(null);
  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const readAction = await dispatch(read({ id, source }));
        setError(null);
        if (readAction.error) {
          throw readAction.error;
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    // 如果存在需要考虑 是否使用缓存
    //hash 不用获取
    // 当 data 不存在时，尝试获取数据
    //当data 存在 只是在内存存在，不保证最新，需要主动每次调用获取新数据，或者主动接受服务器推送

    if (forceUpdate || !memdata) {
      getData();
    }
  }, [dispatch, id]);

  return { data: memdata, isLoading, error };
}

export const useQueryData = (queryConfig) => {
  const dispatch = useDispatch();
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSuccess, setSuccess] = useState(false);
  const isAutoSync = useAppSelector(
    (state) => state.settings.syncSetting.isAutoSync,
  );
  const syncServers = useAppSelector(selectSyncServers);
  const curretnServer = useAppSelector(selectCurrentServer);
  useEffect(() => {
    if (!queryConfig) {
      setLoading(false);
      return;
    }

    const fetchCurrentServerData = async () => {
      try {
        setLoading(true);
        await dispatch(
          queryServer({ server: curretnServer, ...queryConfig }),
        ).then((action) => {
          setSuccess(true);
          setData(action.payload);
        });
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentServerData();
    if (isAutoSync) {
      syncServers.map((server) => {
        dispatch(queryServer({ server, ...queryConfig }));
        // return;
      });
    }
  }, [isAutoSync]);

  return { isLoading, error, data, isSuccess };
};
export const useWriteData = () => {
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const result = {};
  useEffect(() => {}, []);
  return { result, isLoading, error };
};
