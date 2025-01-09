import {
  type PayloadAction,
  asyncThunkCreator,
  buildCreateSlice,
} from "@reduxjs/toolkit";
import { extractCustomId } from "core";
import { API_ENDPOINTS } from "database/config";
import { noloRequest } from "database/requests/noloRequest";

import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";
import { deleteData, removeFromList, upsertOne, write } from "database/dbSlice";
import { filter, reverse } from "rambda";

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
          id,
          content,
          cybotId,
        };
        const action = await dispatch(addAIMessage(message));
        const { array } = action.payload;

        return { array, id };
      },
      {
        rejected: (state, action) => {},
        fulfilled: (state, action) => {
          const { id, array } = action.payload;
          state.ids = reverse(array);
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
    addUserMessage: create.asyncThunk(async (message, thunkApi) => {
      const state = thunkApi.getState();

      const dispatch = thunkApi.dispatch;

      await dispatch(
        write({
          data: { ...message, type: DataType.Msg },
          customId: message.id,
        })
      );
      dispatch(addMessageToUI(message.id));

      const dialogConfig = selectCurrentDialogConfig(state);
      if (dialogConfig?.messageListId) {
        await dispatch(
          addMsgToList({
            itemId: message.id,
            listId: dialogConfig?.messageListId,
          })
        );
      }
    }),
    addAIMessage: create.asyncThunk(
      async ({ content, id, cybotId }, thunkApi) => {
        const dispatch = thunkApi.dispatch;
        const message = {
          role: "assistant",
          id,
          content,
          cybotId,
        };
        dispatch(upsertOne(message));
        dispatch(addMessageToUI(message.id));
        const state = thunkApi.getState();
        const userId = selectCurrentUserId(state);
        const customId = extractCustomId(message.id);
        const config = {
          url: `${API_ENDPOINTS.DATABASE}/write/`,
          method: "POST",
          body: JSON.stringify({
            data: { type: DataType.Message, ...message },
            flags: { isJSON: true },
            customId,
            userId,
          }),
        };
        await noloRequest(state, config);

        const dialogConfig = selectCurrentDialogConfig(state);
        if (dialogConfig?.messageListId) {
          const result = await dispatch(
            addMsgToList({
              itemId: message.id,
              listId: dialogConfig?.messageListId,
            })
          ).unwrap();
          return result;
        }
      }
    ),
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
  messagesReachedMax,
  deleteMessage,
  initMessages,
  removeMessageFromUI,
  addMessageToUI,
  handleSendMessage,
  clearCurrentMessages,
  clearCurrentDialog,
  addMessageToServer,
  addAIMessage,
  addUserMessage,
  streamLLmId,
  sendWithMessageId,
  addMsgToList,
} = messageSlice.actions;

export default messageSlice.reducer;
