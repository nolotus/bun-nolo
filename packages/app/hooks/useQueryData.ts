import { queryServer } from "database/dbSlice";
import { useEffect, useState } from "react";
import { selectCurrentServer, selectSyncServers } from "setting/settingSlice";
import { useAppDispatch } from ".";
import { useAppSelector } from "../hooks";

export const useQueryData = (queryConfig) => {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSuccess, setSuccess] = useState(false);

  const dispatch = useAppDispatch();

  const syncServers = useAppSelector(selectSyncServers);
  const curretnServer = useAppSelector(selectCurrentServer);
  const isAutoSync = useAppSelector(
    (state) => state.settings.syncSetting.isAutoSync
  );
  useEffect(() => {
    if (!queryConfig) {
      setLoading(false);
      return;
    }

    const fetchCurrentServerData = async () => {
      try {
        setLoading(true);

        await dispatch(
          queryServer({ server: curretnServer, ...queryConfig })
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
