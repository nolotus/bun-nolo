import { selectCurrentUser } from "auth/authSlice";
import { useMemo } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import type { AppDispatch, NoloRootState } from "./store";
import { selectById } from "database/dbSlice";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<NoloRootState> = useSelector;

export const useAuth = () => {
  const user = useAppSelector(selectCurrentUser);

  return useMemo(() => ({ user }), [user]);
};
export const useItem = (id: string) => {
  return useAppSelector((state: NoloRootState) => selectById(state, id));
};
