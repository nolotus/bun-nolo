import {
  type PayloadAction,
  asyncThunkCreator,
  buildCreateSlice,
} from "@reduxjs/toolkit";

import { DataType } from "create/types";
import { remove, write } from "database/dbSlice";
import { filter } from "rambda";

import { sendMessageAction } from "./actions/sendMessageAction";
import type { Message } from "./types";
import { deleteDialogMsgsAction } from "./actions/deleteDialogMsgsAction";

export interface MessageSliceState {
  msgs: Message[];
  streamMessages: Message[];
}

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const initialState: MessageSliceState = {
  msgs: [],
  streamMessages: [],
};

export const messageSlice = createSliceWithThunks({
  name: "message",
  initialState: initialState as MessageSliceState,
  reducers: (create) => ({
    initMsgs: create.reducer((state, action) => {
      state.msgs = action.payload;
    }),

    messageStreamEnd: create.asyncThunk(
      async (msg, thunkApi) => {
        const { dispatch } = thunkApi;
        console.log("messageStreamEnd", msg);
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
      console.log("messageStreaming", message);
      const index = state.streamMessages.findIndex(
        (msg) => msg.id === message.id
      );
      if (index !== -1) {
        state.streamMessages[index] = message;
      } else {
        state.streamMessages.push(message); // 修改为 push，添加到末尾
      }
    }),

    deleteMessage: create.asyncThunk(
      async (dbKey: string, thunkApi) => {
        await thunkApi.dispatch(remove(dbKey));
        return { dbKey };
      },
      {
        fulfilled: (state, action) => {
          state.msgs = state.msgs.filter(
            (msg) => msg.dbKey !== action.payload.dbKey
          );
        },
      }
    ),

    handleSendMessage: create.asyncThunk(sendMessageAction),
    deleteDialogMsgs: create.asyncThunk(deleteDialogMsgsAction),
    addMsg: create.asyncThunk(
      async (msg, thunkApi) => {
        console.log("addMsg", msg);
        await thunkApi.dispatch(
          write({
            data: { ...msg, type: DataType.MSG },
            customKey: msg.dbKey,
            //must change
          })
        );
        return msg;
      },
      {
        fulfilled: (state, action) => {
          const hasTheMsg = state.msgs.some(
            (msg) => msg.dbKey === action.payload.dbKey
          );
          if (!hasTheMsg) {
            state.msgs.push(action.payload); // 修改为 push，添加到末尾
          }
        },
      }
    ),

    resetMsgs: create.reducer((state) => {
      state.msgs = [];
      state.streamMessages = [];
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
