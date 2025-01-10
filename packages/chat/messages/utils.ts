import type { NoloRootState } from "app/store";
import { selectEntitiesByIds } from "database/dbSlice";
import { filter, reverse, pipe, isEmpty, tap, flatten } from "rambda";

export const getFilteredMessages = (state: NoloRootState) => {
  const originMessages = selectEntitiesByIds(state, state.message.ids);
  const msgs = state.message.msgs;

  return pipe(
    // 先把两个数组合并拍平
    flatten,
    // 过滤掉 null/undefined/空值
    filter((x) => x !== null && x !== undefined && !isEmpty(x)),
    // 倒序排列
    reverse
  )([originMessages, msgs]);
};
