import { NoloRootState } from "app/store";
import { createSelector } from "@reduxjs/toolkit";
import { uniqBy, prop } from "rambda";

export const selectMsgs = (state: NoloRootState) => state.message.msgs;

export const selectStreamMessages = (state: NoloRootState) =>
  state.message.streamMessages;

export const selectMergedMessages = createSelector(
  [selectMsgs, selectStreamMessages],
  (msgs = [], streamMessages = []) => {
    // 合并并去重所有消息
    const allMessages = uniqBy(prop("id"), [...streamMessages, ...msgs]);

    // 确保streamMessages数据优先
    const mergedMessages = allMessages.map((message) => {
      const streamMessage = streamMessages.find((sm) => sm.id === message.id);
      return streamMessage ? { ...message, ...streamMessage } : message;
    });

    return mergedMessages;
  }
);
