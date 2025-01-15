import { useState, useEffect } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { read } from "database/dbSlice";
import type { AppDispatch, NoloRootState } from "./store";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<NoloRootState> = useSelector;

export function useFetchData<T>(id: string) {
  const dispatch = useDispatch();
  const [data, setData] = useState<T | undefined>();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const getData = async () => {
      try {
        setLoading(true);
        const readAction = await dispatch(read(id)).unwrap();
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
  }, [dispatch, id]);

  return { data, isLoading, error };
}
