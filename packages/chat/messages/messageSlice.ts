import { NoloRootState } from "app/store";
import { createSelector } from "@reduxjs/toolkit";
import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit";
import { filter } from "rambda"; // filter 仍然在 messageStreamEnd 中使用
import { DataType } from "create/types";
import { remove, write } from "database/dbSlice";
import { sendMessageAction } from "./actions/sendMessageAction";
import type { Message } from "./types";
import { deleteDialogMsgsAction } from "./actions/deleteDialogMsgsAction";

export interface MessageSliceState {
  msgs: Message[];
  streamMessages: Message[];
  firstStreamProcessed: boolean; // 标志第一个流是否已处理（主要用于UI提示或首次滚动）
}

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const initialState: MessageSliceState = {
  msgs: [],
  streamMessages: [],
  firstStreamProcessed: false,
};

export const messageSlice = createSliceWithThunks({
  name: "message",
  initialState: initialState as MessageSliceState,
  reducers: (create) => ({
    // 初始化消息列表
    initMsgs: create.reducer<{ payload: Message[] }>((state, action) => {
      state.msgs = action.payload;
      state.streamMessages = []; // 重置流状态
      state.firstStreamProcessed = false;
    }),

    // 消息流结束处理
    messageStreamEnd: create.asyncThunk(
      async (msg: Message, thunkApi) => {
        const { dispatch } = thunkApi;
        console.log("messageStreamEnd: Adding final message", msg);
        await dispatch(addMsg(msg)).unwrap(); // 添加/更新最终消息到 state.msgs 并存库
        return { id: msg.id }; // 返回 ID 用于清理 streamMessages
      },
      {
        fulfilled: (state, action) => {
          const { id } = action.payload;
          console.log("messageStreamEnd: Cleaning stream message with id", id);
          // 从 streamMessages 中移除已完成的消息
          state.streamMessages = filter(
            (streamMsg) => streamMsg.id !== id,
            state.streamMessages
          );
        },
        rejected: (state, action) => {
          console.error("messageStreamEnd failed:", action.error);
          // 尝试清理，以防失败时流消息残留
          if (action.meta.arg?.id) {
            state.streamMessages = filter(
              (streamMsg) => streamMsg.id !== action.meta.arg.id,
              state.streamMessages
            );
          }
        },
      }
    ),

    // 处理正在流式传输的消息更新
    messageStreaming: create.reducer<Message>((state, action) => {
      const message = action.payload;
      // console.log("messageStreaming: Updating stream message", message.id);
      const index = state.streamMessages.findIndex(
        (msg) => msg.id === message.id
      );
      if (index !== -1) {
        // 合并更新，确保保留 streamMessages[index] 中 message 没有的字段
        state.streamMessages[index] = {
          ...state.streamMessages[index],
          ...message,
        };
      } else {
        // 新的流式消息
        state.streamMessages.push(message);
        if (!state.firstStreamProcessed) {
          console.log("messageStreaming: First stream processed flag set");
          state.firstStreamProcessed = true;
        }
      }
    }),

    // 删除单条消息
    deleteMessage: create.asyncThunk(
      async (dbKey: string, thunkApi) => {
        await thunkApi.dispatch(remove(dbKey));
        return { dbKey };
      },
      {
        fulfilled: (state, action) => {
          const dbKeyToRemove = action.payload.dbKey;
          console.log(
            "deleteMessage: Removing message with dbKey",
            dbKeyToRemove
          );
          state.msgs = state.msgs.filter((msg) => msg.dbKey !== dbKeyToRemove);
          // 同时清理 streamMessages
          state.streamMessages = state.streamMessages.filter(
            (msg) => msg.dbKey !== dbKeyToRemove
          );
        },
        rejected: (state, action) => {
          console.error("deleteMessage failed:", action.error);
        },
      }
    ),

    // 发送新消息 (委托给 action)
    handleSendMessage: create.asyncThunk(sendMessageAction),

    // 删除整个对话的消息 (委托给 action)
    deleteDialogMsgs: create.asyncThunk(deleteDialogMsgsAction),

    // 添加或更新一条消息到 state.msgs 并写入数据库
    addMsg: create.asyncThunk(
      async (msg: Message, thunkApi) => {
        console.log("addMsg: Writing message", msg.id);
        await thunkApi.dispatch(
          write({
            data: { ...msg, type: DataType.MSG },
            customKey: msg.dbKey,
          })
        );
        return msg;
      },
      {
        fulfilled: (state, action) => {
          const newMessage = action.payload;
          const index = state.msgs.findIndex(
            (msg) => msg.dbKey === newMessage.dbKey || msg.id === newMessage.id
          );
          if (index === -1) {
            // 不存在，添加到末尾
            console.log(
              "addMsg: Adding new message to state.msgs",
              newMessage.id
            );
            state.msgs.push(newMessage);
          } else {
            // 已存在，用新消息数据合并更新
            console.log(
              "addMsg: Updating existing message in state.msgs",
              newMessage.id
            );
            state.msgs[index] = { ...state.msgs[index], ...newMessage };
          }
        },
        rejected: (state, action) => {
          console.error("addMsg failed:", action.error);
        },
      }
    ),

    // 重置消息状态
    resetMsgs: create.reducer((state) => {
      console.log("resetMsgs: Clearing all messages and stream state");
      state.msgs = [];
      state.streamMessages = [];
      state.firstStreamProcessed = false;
    }),
  }),
});

export const {
  messageStreamEnd,
  messageStreaming,
  deleteMessage,
  handleSendMessage,
  deleteDialogMsgs,
  addMsg,
  initMsgs,
  resetMsgs,
} = messageSlice.actions;

export default messageSlice.reducer;

// --- Selectors ---

export const selectMsgs = (state: NoloRootState) => state.message.msgs;
export const selectStreamMessages = (state: NoloRootState) =>
  state.message.streamMessages;
export const selectFirstStreamProcessed = (state: NoloRootState) =>
  state.message.firstStreamProcessed;

/**
 * Selector: 合并持久化消息 (msgs) 和流式消息 (streamMessages)。
 * 使用 Map 确保流式消息更新能覆盖旧消息，并大致保持添加顺序。
 * 不再进行全局排序，新消息会出现在末尾。
 */
export const selectMergedMessages = createSelector(
  [selectMsgs, selectStreamMessages],
  (msgs = [], streamMessages = []) => {
    // console.log("selectMergedMessages: Recalculating...");
    const messageMap = new Map<string, Message>();

    // 1. 添加基础消息
    for (const msg of msgs) {
      if (msg?.id) {
        // 基本检查
        messageMap.set(msg.id, msg);
      }
    }

    // 2. 添加/更新流式消息，覆盖 Map 中的同 ID 项
    for (const streamMsg of streamMessages) {
      if (streamMsg?.id) {
        // 基本检查
        const existingMsg = messageMap.get(streamMsg.id);
        messageMap.set(
          streamMsg.id,
          existingMsg ? { ...existingMsg, ...streamMsg } : streamMsg
        );
      }
    }

    // 3. 从 Map 提取值，顺序依赖于插入/更新顺序
    const mergedMessages = Array.from(messageMap.values());
    // console.log(`selectMergedMessages: Merged ${mergedMessages.length} messages.`);
    return mergedMessages;
  }
);
