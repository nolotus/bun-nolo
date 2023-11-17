import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
} from '@reduxjs/toolkit';
import { RootState } from 'app/store';

import { ChatConfig, Message, ChatSliceState } from './types';
export const chatAdapter = createEntityAdapter<ChatConfig>({
  // Assume IDs are stored in the 'id' field of each chat config
  selectId: (chat) => chat.id,
});

export const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    allowSend: true,
    tempMessage: {
      id: Date.now(),
      role: 'user',
      content: '',
    },
    currentChatConfig: null,
    isStopped: false,
    isMessageStreaming: false,
    chatList: chatAdapter.getInitialState(),
  },
  reducers: {
    sendMessage: (state: ChatSliceState, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
      state.isMessageStreaming = true;
    },
    receiveMessage: (state: ChatSliceState, action: PayloadAction<Message>) => {
      // 添加对方回复的消息
      state.messages.push(action.payload);
    },
    clearMessages: (state: ChatSliceState) => {
      // 清除消息
      state.messages = [];
      state.tempMessage = { role: 'assistant', content: '' };
    },
    setCurrentChatConfig: (
      state: ChatSliceState,
      action: PayloadAction<ChatConfig>,
    ) => {
      state.currentChatConfig = action.payload;
    },
    fetchchatListSuccess: (
      state: ChatSliceState,
      action: PayloadAction<any[]>,
    ) => {
      chatAdapter.upsertMany(state.chatList, action.payload);
      if (!state.currentChatConfig) {
        state.currentChatConfig = action.payload[0] ? action.payload[0] : null;
      }
    },

    fetchDefaultConfig: (
      state: ChatSliceState,
      action: PayloadAction<ChatConfig>,
    ) => {
      state.currentChatConfig = action.payload;
      chatAdapter.addOne(state.chatList, action.payload);
    },
    retry: (state: ChatSliceState) => {
      state.tempMessage = { role: 'assistant', content: '' };
      state.messages.pop();
    },
    messageStreamEnd: (
      state: ChatSliceState,
      action: PayloadAction<Message>,
    ) => {
      state.messages.push(action.payload);
      state.tempMessage = { role: '', content: '' };
      state.isMessageStreaming = false;
    },
    messageStreaming: (
      state: ChatSliceState,
      action: PayloadAction<Message>,
    ) => {
      state.tempMessage = action.payload;
      state.isMessageStreaming = true;
    },
    messagesReachedMax: (state: ChatSliceState) => {
      state.isStopped = true;
    },
    continueMessage: (
      state: ChatSliceState,
      action: PayloadAction<Message>,
    ) => {
      state.isStopped = false;
      state.messages.push(action.payload);
    },
    messageEnd: (state: ChatSliceState) => {
      state.isMessageStreaming = false;
    },
    reloadChatList: (
      state: ChatSliceState,
      action: PayloadAction<ChatConfig[]>,
    ) => {
      chatAdapter.setAll(state.chatList, action.payload);
    },
    updateChatConfig: (
      state: ChatSliceState,
      action: PayloadAction<{ id: string, changes: ChatConfig }>,
    ) => {
      chatAdapter.upsertOne(state.chatList, action.payload);
    },
  },
});

export const {
  sendMessage,
  receiveMessage,
  clearMessages,
  setCurrentChatConfig,
  fetchchatListSuccess,
  fetchDefaultConfig,
  retry,
  messageStreamEnd,
  messageStreaming,
  messagesReachedMax,
  continueMessage,
  messageEnd,
  reloadChatList,
  updateChatConfig,
} = chatSlice.actions;

export default chatSlice.reducer;
export const selectChat = (state: RootState) => state.chat;
