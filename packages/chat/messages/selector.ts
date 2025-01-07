import { NoloRootState } from "app/store";
import { createSelector } from "@reduxjs/toolkit";
import { selectById } from "database/dbSlice";
import { uniqBy, prop } from "rambda";

export const selectMessageList = (state: NoloRootState) => state.message.ids;

export const selectStreamMessages = (state: NoloRootState) =>
  state.message.streamMessages;

export const selectMergedMessages = createSelector(
  [selectMessageList, selectStreamMessages],
  (ids = [], streamMessages = []) => {
    // 创建一个仅包含id的对象数组
    const idMessages = (ids || []).map((id) => ({ id }));

    // 将idMessages和streamMessages合并
    const allMessages = uniqBy(prop("id"), [...streamMessages, ...idMessages]);

    // 遍历allMessages，合并相同id的数据
    const mergedMessages = allMessages.map((message) => {
      const streamMessage = streamMessages.find((sm) => sm.id === message.id);
      return streamMessage ? { ...message, ...streamMessage } : message;
    });

    return mergedMessages;
  }
);

export const selectEntitiesByIds = createSelector(
  [
    (state: NoloRootState, ids: string[]) =>
      ids.map((id) => selectById(state, id)),
  ],
  (entities) => entities.filter((entity) => entity !== undefined)
);
export const selectEntitiesByMessageIds = createSelector(
  [selectMessageList, (state: NoloRootState) => state],
  (messageIds, state) => selectEntitiesByIds(state, messageIds)
);
