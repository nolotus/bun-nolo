import {
  type PayloadAction,
  asyncThunkCreator,
  buildCreateSlice,
} from "@reduxjs/toolkit";
import { API_ENDPOINTS } from "database/config";

import { DataType } from "create/types";
import { deleteData, removeFromList, write } from "database/dbSlice";
import { filter } from "rambda";

import { selectCurrentDialogConfig } from "../dialog/dialogSlice";
import { sendMessageAction } from "./actions/sendMessageAction";
import type { Message } from "./types";
import { selectCurrentServer } from "setting/settingSlice";

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

    removeMessageFromUI: create.reducer((state, action) => {
      state.msgs = state.msgs.filter((msg) => msg.id !== action.payload);
    }),

    deleteMessage: create.asyncThunk(async (messageId: string, thunkApi) => {
      const state = thunkApi.getState();
      const dialogConfig = selectCurrentDialogConfig(state);
      thunkApi.dispatch(deleteData({ id: messageId }));
      if (dialogConfig.messageListId) {
        thunkApi.dispatch(
          removeFromList({
            itemId: messageId,
            listId: dialogConfig.messageListId,
          })
        );
      }
      thunkApi.dispatch(removeMessageFromUI(messageId));
    }),

    handleSendMessage: create.asyncThunk(sendMessageAction),
    clearCurrentMessages: create.reducer((state, action) => {
      state.ids = null;
      state.msgs = [];
      state.streamMessages = [];
    }),
    clearCurrentDialog: create.asyncThunk(
      async (args, thunkApi) => {
        const state = thunkApi.getState();
        const dispatch = thunkApi.dispatch;
        const dialog = selectCurrentDialogConfig(state);
        const { messageListId } = dialog;

        if (messageListId) {
          const body = { ids: state.message.ids };
          const deleteMessageListAction = await dispatch(
            deleteData({
              id: messageListId,
              body,
            })
          );
        }
      },
      {
        fulfilled: (state, action) => {
          state.ids = [];
          state.streamMessages = [];
        },
      }
    ),
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
  }),
});

export const {
  messageStreamEnd,
  messageStreaming,
  deleteMessage,
  initMessages,
  removeMessageFromUI,
  handleSendMessage,
  clearCurrentMessages,
  clearCurrentDialog,
  sendWithMessageId,
  addMsg,
  initMsgs,
} = messageSlice.actions;

export default messageSlice.reducer;
