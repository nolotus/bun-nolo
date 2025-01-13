import {
  type PayloadAction,
  asyncThunkCreator,
  buildCreateSlice,
} from "@reduxjs/toolkit";

import { DataType } from "create/types";
import { deleteData, write } from "database/dbSlice";
import { filter } from "rambda";

import { sendMessageAction } from "./actions/sendMessageAction";
import type { Message } from "./types";
import { deleteAllMessages } from "./actions/deleteAllMessages";

export interface MessageSliceState {
  ids: string[] | null;
  msgs: Message[];
  streamMessages: Message[];
}
const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const initialState: MessageSliceState = {
  ids: [],
  msgs: [],
  streamMessages: [],
};
export const messageSlice = createSliceWithThunks({
  name: "message",
  initialState: initialState as MessageSliceState,
  reducers: (create) => ({
    initMessages: create.reducer((state, action) => {
      state.ids = action.payload;
    }),
    initMsgs: create.reducer((state, action) => {
      state.msgs = action.payload;
    }),

    messageStreamEnd: create.asyncThunk(
      async (msg, thunkApi) => {
        const { dispatch } = thunkApi;
        await dispatch(addMsg(msg)).unwrap();
        return { id: msg.id };
      },
      {
        fulfilled: (state, action) => {
          const { id } = action.payload;
          state.streamMessages = filter(
            (msg) => msg.id !== id,
            state.streamMessages
          );
        },
      }
    ),

    messageStreaming: create.reducer<Message>((state, action) => {
      const message = action.payload;
      const index = state.streamMessages.findIndex(
        (msg) => msg.id === message.id
      );
      if (index !== -1) {
        state.streamMessages[index] = message;
      } else {
        state.streamMessages.unshift(message);
      }
    }),

    deleteMessage: create.asyncThunk(
      async (messageId: string, thunkApi) => {
        await thunkApi.dispatch(deleteData(messageId));
        return messageId;
      },
      {
        fulfilled: (state, action) => {
          state.msgs = state.msgs.filter((msg) => msg.id !== action.payload);
        },
      }
    ),

    handleSendMessage: create.asyncThunk(sendMessageAction),

    clearCurrentDialog: create.asyncThunk(deleteAllMessages, {
      fulfilled: (state, action) => {
        const { ids } = action.payload;
        // 清空当前对话ID列表
        state.ids = [];
        // 过滤掉已删除的消息
        state.msgs = state.msgs.filter((msg) => !ids.includes(msg.id));
        // 清空流消息
        state.streamMessages = [];
      },
    }),

    addMsg: create.asyncThunk(
      async (msg, thunkApi) => {
        await thunkApi.dispatch(
          write({
            data: { ...msg, type: DataType.MSG },
            customId: msg.id,
          })
        );
        return msg;
      },
      {
        fulfilled: (state, action) => {
          const hasTheMsg = state.msgs.includes(action.payload.id);
          if (!hasTheMsg) {
            state.msgs.unshift(action.payload);
          }
        },
      }
    ),

    //not use yet
    sendWithMessageId: create.asyncThunk(async (messageId, thunkApi) => {
      console.log("messageId", messageId);
      const state = thunkApi.getState();
    }, {}),
    resetMsgs: create.reducer((state) => {
      state.msgs = [];
    }),
  }),
});

export const {
  messageStreamEnd,
  messageStreaming,
  deleteMessage,
  initMessages,
  handleSendMessage,
  clearCurrentDialog,
  sendWithMessageId,
  addMsg,
  initMsgs,
  resetMsgs,
} = messageSlice.actions;

export default messageSlice.reducer;
