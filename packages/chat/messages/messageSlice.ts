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
  streamMessages: Message[];
}
const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const initialState: MessageSliceState = {
  ids: null,
  streamMessages: [],
};
export const messageSlice = createSliceWithThunks({
  name: "message",
  initialState: initialState as MessageSliceState,
  reducers: (create) => ({
    initMessages: create.reducer((state, action) => {
      state.ids = action.payload;
    }),
    messageStreamEnd: create.asyncThunk(
      async ({ id, content, cybotId }, thunkApi) => {
        const { dispatch } = thunkApi;
        const message = {
          role: "assistant",
          id,
          content,
          cybotId,
        };
        await dispatch(addMsg(message)).unwrap();
        return { id };
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

    addMessageToUI: create.reducer((state, action: PayloadAction<string>) => {
      if (!state.ids.includes(action.payload)) {
        state.ids.unshift(action.payload);
      }
    }),

    removeMessageFromUI: create.reducer(
      (state, action: PayloadAction<string>) => {
        state.ids = state.ids.filter((id) => id !== action.payload);
      }
    ),
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
    addMsg: create.asyncThunk(async (msg, thunkApi) => {
      const state = thunkApi.getState();
      const dispatch = thunkApi.dispatch;
      await dispatch(
        write({
          data: { ...msg, type: DataType.Msg },
          customId: msg.id,
        })
      );
      dispatch(addMessageToUI(msg.id));

      const dialogConfig = selectCurrentDialogConfig(state);
      if (dialogConfig?.messageListId) {
        await dispatch(
          addMsgToList({
            itemId: msg.id,
            listId: dialogConfig?.messageListId,
          })
        );
      }
    }),

    addMsgToList: create.asyncThunk(async ({ itemId, listId }, thunkApi) => {
      const state = thunkApi.getState();
      const baseUrl = selectCurrentServer(state);
      const token = state.auth.currentToken;
      const createAuthHeaders = (token: string) => ({
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const response = await fetch(`${baseUrl}${API_ENDPOINTS.PUT}/${listId}`, {
        method: "PUT",
        ...createAuthHeaders(token),
        body: JSON.stringify({ id: itemId }),
      });
      const json = await response.json();
      return json;
    }),

    //not use yet
    sendWithMessageId: create.asyncThunk(async (messageId, thunkApi) => {
      console.log("messageId", messageId);
      const state = thunkApi.getState();
    }, {}),
  }),
});

export const {
  sendMessage,
  messageStreamEnd,
  messageStreaming,
  deleteMessage,
  initMessages,
  removeMessageFromUI,
  addMessageToUI,
  handleSendMessage,
  clearCurrentMessages,
  clearCurrentDialog,
  sendWithMessageId,
  addMsgToList,
  addMsg,
} = messageSlice.actions;

export default messageSlice.reducer;
