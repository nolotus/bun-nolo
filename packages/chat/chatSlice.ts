import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "app/store";
interface Message {
  role: string;
  content: string;
  image?: string;
}
interface ChatConfig {
  id: string;
  name?: string;
  description?: string;
  type?: string;
  model?: string;
  replyRule?: string;
  knowledge?: string;
  path?: string;
}

type ChatSliceState = {
  messages: Message[];
  allowSend: boolean;
  tempMessage: Message;
  chatList: ChatConfig[];
  currentChatConfig: ChatConfig | null;
  isStopped: boolean;
  isMessageStreaming: boolean;
};

export const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    allowSend: true,
    tempMessage: {
      id: Date.now(),
      role: "user",
      content: "",
    },
    chatList: [],
    currentChatConfig: null,
    isStopped: false,
    isMessageStreaming: false,
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
      state.tempMessage = { role: "assistant", content: "" };
    },
    setCurrentChatConfig: (
      state: ChatSliceState,
      action: PayloadAction<ChatConfig>
    ) => {
      state.currentChatConfig = action.payload;
    },
    fetchNolotuschatListSuccess: (
      state: ChatSliceState,
      action: PayloadAction<any[]>
    ) => {
      let idSet = new Set(state.chatList.map((chat) => chat.id));
      action.payload.forEach((chat) => {
        if (!idSet.has(chat.id)) {
          state.chatList.push(chat);
        }
      });
      if (!state.currentChatConfig) {
        state.currentChatConfig = action.payload[0] ? action.payload[0] : null;
      }
    },
    fetchUserChatListSuccess: (
      state: ChatSliceState,
      action: PayloadAction<any[]>
    ) => {
      let idSet = new Set(state.chatList.map((chat) => chat.id));
      action.payload.forEach((chat) => {
        if (!idSet.has(chat.id)) {
          state.chatList.push(chat);
        }
      });
      if (!state.currentChatConfig) {
        state.currentChatConfig = action.payload[0] ? action.payload[0] : null;
      }
    },
    setCurrentChatByID: (
      state: ChatSliceState,
      action: PayloadAction<String>
    ) => {
      const targetChat = state.chatList.find(
        (chat) => chat.id === action.payload
      );
      if (targetChat) {
        state.currentChatConfig = targetChat;
      }
    },
    fetchDefaultConfig: (
      state: ChatSliceState,
      action: PayloadAction<ChatConfig>
    ) => {
      state.currentChatConfig = action.payload;
      if (state.chatList.length === 0) {
        state.chatList.push(action.payload);
      } else {
        const idSet = new Set(state.chatList.map((chat) => chat.id));
        if (!idSet.has(action.payload.id)) {
          state.chatList.push(action.payload);
        }
      }
    },
    retry: (state: ChatSliceState) => {
      state.tempMessage = { role: "assistant", content: "" };
      state.messages.pop();
    },
    messageStreamEnd: (
      state: ChatSliceState,
      action: PayloadAction<Message>
    ) => {
      state.messages.push(action.payload);
      state.tempMessage = { role: "", content: "" };
      state.isMessageStreaming = false;
    },
    messageStreaming: (
      state: ChatSliceState,
      action: PayloadAction<Message>
    ) => {
      state.tempMessage = action.payload;
      state.isMessageStreaming = true;
    },
    messagesReachedMax: (state: ChatSliceState) => {
      state.isStopped = true;
    },
    continueMessage: (
      state: ChatSliceState,
      action: PayloadAction<Message>
    ) => {
      state.isStopped = false;
      state.messages.push(action.payload);
    },
    messageEnd: (state: ChatSliceState) => {
      state.isMessageStreaming = false;
    },
  },
});

export const {
  sendMessage,
  receiveMessage,
  clearMessages,
  setCurrentChatConfig,
  fetchNolotuschatListSuccess,
  fetchUserChatListSuccess,
  setCurrentChatByID,
  fetchDefaultConfig,
  retry,
  messageStreamEnd,
  messageStreaming,
  messagesReachedMax,
  continueMessage,
  messageEnd,
} = chatSlice.actions;

export default chatSlice.reducer;
export const selectChat = (state: RootState) => state.chat;
