import { NoloRootState } from "app/store";
import { pipe, flatten, filter, reverse } from "rambda";

export const getFilteredMessages = (state: NoloRootState) => {
  const msgs = state.message.msgs;

  return pipe(
    flatten,
    // 过滤掉 null/undefined 和 content 为空的消息
    filter((msg) => {
      if (!msg) return false;
      const content = msg.content;
      return content != null && content.trim() !== "";
    }),
    reverse
  )([msgs]);
};
