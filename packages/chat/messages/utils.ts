import { NoloRootState } from "app/store";
import { pipe, flatten, filter, reverse } from "rambda";

export const getFilteredMessages = (state: NoloRootState) => {
  const msgs = state.message.msgs;

  return pipe(
    // 直接处理单个数组
    flatten,
    // 过滤掉 null/undefined
    filter((x) => x != null),
    // 倒序排列
    reverse
  )([msgs]);
};
