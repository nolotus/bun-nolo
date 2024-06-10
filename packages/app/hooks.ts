import { useState, useEffect } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import { selectById, syncQuery } from "database/dbSlice";
import { query, read } from "database/dbSlice";

import type { AppDispatch, NoloRootState } from "./store";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<NoloRootState> = useSelector;

export const useItem = (id: string) => {
  return useAppSelector((state: NoloRootState) => selectById(state, id));
};
export function useFetchData(id) {
  // 使用 redux 存储中的数据
  const data = useAppSelector((state) => selectById(state, id));
  const dispatch = useDispatch();
  // 状态管理
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 定义获取数据的异步函数
    const getData = async () => {
      try {
        setLoading(true); // 开始加载
        dispatch(read(id)); // 分发读取操作
        setError(null); // 正常情况下清除错误信息
      } catch (err) {
        setError(err); // 捕捉并设置错误信息
      } finally {
        setLoading(false); // 结束加载
      }
    };
    // 当 data 不存在时，尝试获取数据
    if (!data) {
      getData();
    }
  }, [dispatch, id, data]);

  return { data, isLoading, error };
}

export const useQueryData = (queryConfig) => {
  const dispatch = useDispatch();
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSuccess, setSuccess] = useState(false);

  useEffect(() => {
    if (!queryConfig) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        await dispatch(query(queryConfig)).then((action) => {
          setSuccess(true);
          setData(action.payload);
        });
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
