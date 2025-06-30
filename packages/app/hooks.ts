import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { read } from "database/dbSlice";

export function useFetchData<T>(dbKey: string) {
  const dispatch = useDispatch();
  const [data, setData] = useState<T | undefined>();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const getData = async () => {
      try {
        setLoading(true);
        const readAction = await dispatch(read(dbKey)).unwrap();
        if (mounted) {
          setData(readAction);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getData();

    return () => {
      mounted = false;
    };
  }, [dispatch, dbKey]);

  return { data, isLoading, error };
}
