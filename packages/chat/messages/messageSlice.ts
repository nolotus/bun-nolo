import {
  PayloadAction,
  nanoid,
  buildCreateSlice,
  asyncThunkCreator,
} from "@reduxjs/toolkit";
import { API_ENDPOINTS } from "database/config";

import { Message, MessageSliceState } from "./types";
import {
  selectCurrentDialogConfig,
  selectCurrentLLMConfig,
} from "../dialog/dialogSlice";
import { ulid } from "ulid";
import { DataType } from "create/types";
import { selectCurrentUserId } from "auth/selectors";
import { removeOne, upsertOne } from "database/dbSlice";

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

export const messageSlice = createSliceWithThunks({
  name: "message",
  initialState: {
    messageListId: null,
    messageIdsList: [],
    messages: [],
    isStopped: false,
    isMessageStreaming: false,
    tempMessage: {},
  },
  // reducers: {
  //   sendMessage: (state: MessageSliceState, action: PayloadAction<Message>) => {

  //   },

  // },

  reducers: (create) => ({
    initMessages: create.asyncThunk(
      async (messageListId, thunkApi) => {
        const res = await fetch(
          `http://localhost${API_ENDPOINTS.DATABASE}/read/${messageListId}`,
        );
        return await res.json();
      },
      {
        fulfilled: (state, action) => {
          state.messageIdsList = action.payload.array;
        },
      },
    ),
    messageStreamEnd: create.asyncThunk(
      async (message, thunkApi) => {
        thunkApi.dispatch(upsertOne(message));
        thunkApi.dispatch(addMessageToUI(message.id));
        const state = thunkApi.getState();
        const userId = selectCurrentUserId(state);
        const token = state.auth.currentToken;

        const llmConfig = selectCurrentLLMConfig(state);
        const dialogConfig = selectCurrentDialogConfig(state);

        const writeMessage = await fetch(
          `http://localhost${API_ENDPOINTS.DATABASE}/write/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              data: { type: DataType.Message, ...message },
              flags: { isJSON: true },
              customId: ulid(),
              userId,
            }),
          },
        );
        const saveMessage = await writeMessage.json();

        const updateId = dialogConfig.messageListId;
        const writeMessageToList = await fetch(
          `http://localhost${API_ENDPOINTS.DATABASE}/update/${updateId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              id: saveMessage.noloId,
            }),
          },
        );
        return await writeMessageToList.json();
      },
      {
        rejected: (state, action) => {
          // state.error = action.payload ?? action.error;
          console.log("action", action);
        },
        fulfilled: (state, action) => {
          state.tempMessage = { role: "assistant", content: "", id: ulid() };
          state.isMessageStreaming = false;
        },
      },
    ),
    startSendingMessage: create.reducer((state, action) => {
      const message = action.payload;
      state.messageIdsList.push(message.id);
      state.tempMessage = {
        role: "assistant",
        content: "loading",
        id: ulid(),
      };
      state.isMessageStreaming = true;
    }),
    sendMessage: create.asyncThunk(
      async (message, thunkApi) => {
        console.log("start send", message);
        thunkApi.dispatch(upsertOne(message));
        console.log("startSendingMessage");
        thunkApi.dispatch(startSendingMessage(message));
        console.log("finish dispatch");

        const state = thunkApi.getState();
        const token = state.auth.currentToken;
        const userId = selectCurrentUserId(state);
        console.log("start");
        try {
          const writeMessage = await fetch(
            `http://localhost${API_ENDPOINTS.DATABASE}/write/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                data: { type: DataType.Message, ...message },
                flags: { isJSON: true },
                customId: ulid(),
                userId,
              }),
            },
          );
          const saveMessage = await writeMessage.json();
          const dialogConfig = selectCurrentDialogConfig(state);
          const updateId = dialogConfig.messageListId;
          console.log("saveMessage", saveMessage);

          const writeMessageToList = await fetch(
            `http://localhost${API_ENDPOINTS.DATABASE}/update/${updateId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                id: saveMessage.noloId,
              }),
            },
          );
          console.log("result", writeMessageToList);

          const result = await writeMessageToList.json();
          console.log("result", result);
          return result;
        } catch (error) {
          console.log("error", error);
          return error;
        }
      },
      {
        pending: () => {},
        rejected: (state, action) => {
          // state.error = action.payload ?? action.error;
          console.log("action", action);
        },
        fulfilled: (state, action) => {
          state.messageIdsList = action.payload.array;
        },
      },
    ),
    // sendMessage: create.reducer<Message>((state, action) => {
    //   const message = action.payload;
    //   state.messages.push(message);
    //   state.tempMessage = {
    //     role: "assistant",
    //     content: "loading",
    //     id: nanoid(),
    //   };
    //   state.isMessageStreaming = true;
    // }),

    receiveMessage: create.reducer((state, action) => {
      state.messages.push(action.payload);
      state.tempMessage = {};
    }),
    clearMessages: create.reducer<Message>((state, action) => {
      state.messages = [];
      state.tempMessage = { role: "assistant", content: "", id: nanoid() };
    }),
    retry: create.reducer<Message>((state, action) => {
      state.tempMessage = { role: "assistant", content: "", id: nanoid() };
      state.messages.pop();
    }),

    messageStreaming: create.reducer<Message>((state, action) => {
      state.tempMessage = action.payload;
      state.isMessageStreaming = true;
    }),
    addMessageToUI: create.reducer((state, action: PayloadAction<string>) => {
      state.messageIdsList.push(action.payload);
    }),
    removeMessageFromUI: create.reducer(
      (state, action: PayloadAction<string>) => {
        state.messageIdsList = state.messageIdsList.filter(
          (id) => id !== action.payload,
        );
      },
    ),
    deleteMessage: create.asyncThunk(
      async (messageId: string, thunkApi) => {
        thunkApi.dispatch(removeMessageFromUI(messageId));
        // thunkApi.dispatch(removeOne(messageId));
        const state = thunkApi.getState();
        const token = state.auth.currentToken;
        const userId = selectCurrentUserId(state);
        const dialogConfig = selectCurrentDialogConfig(state);

        const deleteMessage = await fetch(
          `http://localhost${API_ENDPOINTS.DATABASE}/delete/${messageId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({}),
          },
        );
        const deleteMessageFromList = await fetch(
          `http://localhost${API_ENDPOINTS.DATABASE}/update/${dialogConfig.messageListId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              id: messageId,
              action: "remove",
            }),
          },
        );
      },

      {
        pending: () => {},
        fulfilled: () => {},
      },
    ),
    deleteNotFound: create.asyncThunk(
      async (messageId: string, thunkApi) => {
        thunkApi.dispatch(removeMessageFromUI(messageId));
        // thunkApi.dispatch(removeOne(messageId));
        const state = thunkApi.getState();
        const token = state.auth.currentToken;
        const userId = selectCurrentUserId(state);
        const dialogConfig = selectCurrentDialogConfig(state);

        const deleteMessageFromList = await fetch(
          `http://localhost${API_ENDPOINTS.DATABASE}/update/${dialogConfig.messageListId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              id: messageId,
              action: "remove",
            }),
          },
        );
        console.log("deleteMessageFromList", deleteMessageFromList);
      },

      {
        pending: () => {},
        fulfilled: () => {},
      },
    ),
    messageEnd: create.reducer((state, action) => {
      state.isMessageStreaming = false;
    }),
    continueMessage: create.reducer((state, action) => {
      state.isStopped = false;
      state.messages.push(action.payload);
    }),
    messagesReachedMax: create.reducer((state, action) => {
      state.isStopped = true;
    }),
  }),
});

export const {
  sendMessage,
  receiveMessage,
  clearMessages,
  retry,
  messageStreamEnd,
  messageStreaming,
  messagesReachedMax,
  continueMessage,
  messageEnd,
  deleteMessage,
  initMessages,
  startSendingMessage,
  removeMessageFromUI,
  deleteNotFound,
  addMessageToUI,
} = messageSlice.actions;

export default messageSlice.reducer;
