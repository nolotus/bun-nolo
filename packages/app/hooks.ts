import { useState, useEffect, useMemo } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import { selectById } from "database/dbSlice";
import { query, read } from "database/dbSlice";
import { selectCurrentUser } from "auth/authSlice";

import type { AppDispatch, NoloRootState } from "./store";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<NoloRootState> = useSelector;

export const useAuth = () => {
  const user = useAppSelector(selectCurrentUser);
  return useMemo(() => ({ user }), [user]);
};
export const useItem = (id: string) => {
  return useAppSelector((state: NoloRootState) => selectById(state, id));
};
export function useFetchData(id) {
  // 使用 redux 存储中的数据
  const data = useAppSelector((state) => selectById(state, id));
  const dispatch = useDispatch();
  // 状态管理
  const [loading, setLoading] = useState(false);
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

  // 返回数据、加载状态和错误信息供组件使用
  return { data, loading, error };
}

export const useQueryData = (queryOptions) => {
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!queryOptions) {
      setLoading(false);
      return; // 如果没有提供查询选项，不执行查询
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        await dispatch(query(queryOptions));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { isLoading, error };
};
