import { NoloRootState } from "app/store";
import { createSelector } from "@reduxjs/toolkit";
import { uniqBy, prop } from "rambda";

export const selectMessageList = (state: NoloRootState) => state.message.ids;
export const selectMsgs = (state: NoloRootState) => state.message.msgs;

export const selectStreamMessages = (state: NoloRootState) =>
  state.message.streamMessages;

export const selectMergedMessages = createSelector(
  [selectMessageList, selectMsgs, selectStreamMessages],
  (ids = [], msgs = [], streamMessages = []) => {
    // 将msgs数组转换为id索引的Map
    const msgsMap = new Map(msgs.map((msg) => [msg.id, msg]));

    // ids为空时使用msgs的id
    const effectiveIds = ids?.length ? ids : Array.from(msgsMap.keys());

    // 合并基础消息
    const baseMessages = effectiveIds.map((id) => ({
      id,
      ...(msgsMap.get(id) || {}),
    }));

    // 合并并去重
    const allMessages = uniqBy(prop("id"), [
      ...streamMessages,
      ...baseMessages,
    ]);

    // 确保streamMessages优先
    const mergedMessages = allMessages.map((message) => {
      const streamMessage = streamMessages.find((sm) => sm.id === message.id);
      return streamMessage ? { ...message, ...streamMessage } : message;
    });

    console.groupEnd();
    return mergedMessages;
  }
);
