import { NoloRootState } from "app/store";
import { createSelector } from "@reduxjs/toolkit";
import { uniqBy, prop, sort } from "rambda";

export const selectMsgs = (state: NoloRootState) => state.message.msgs;

export const selectStreamMessages = (state: NoloRootState) =>
  state.message.streamMessages;

export const selectMergedMessages = createSelector(
  [selectMsgs, selectStreamMessages],
  (msgs = [], streamMessages = []) => {
    // 合并并去重所有消息
    const allMessages = uniqBy(prop("id"), [...msgs, ...streamMessages]);

    // 确保streamMessages数据优先
    const mergedMessages = allMessages.map((message) => {
      const streamMessage = streamMessages.find((sm) => sm.id === message.id);
      return streamMessage ? { ...message, ...streamMessage } : message;
    });

    // 使用Rambda的sort函数，按创建时间升序排序（旧消息在前，新消息在后）
    return sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aTime - bTime;
    }, mergedMessages);
  }
);
