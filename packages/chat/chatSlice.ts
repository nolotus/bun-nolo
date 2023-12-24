import {
	createSlice,
	PayloadAction,
	createEntityAdapter,
} from "@reduxjs/toolkit";
import { RootState } from "app/store";

import { ChatConfig, ChatSliceState } from "./types";
export const chatAdapter = createEntityAdapter<ChatConfig>({
	// Assume IDs are stored in the 'id' field of each chat config
	selectId: (chat) => chat.id,
});

export const chatSlice = createSlice({
	name: "chat",
	initialState: {
		currentChatConfig: null,
		isStopped: false,
		isMessageStreaming: false,
		chatList: chatAdapter.getInitialState(),
	},
	reducers: {
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
			chatAdapter.upsertOne(state.chatList, action.payload);
		},

		reloadChatList: (
			state: ChatSliceState,
			action: PayloadAction<ChatConfig[]>,
		) => {
			chatAdapter.setAll(state.chatList, action.payload);
		},
		updateChatConfig: (
			state: ChatSliceState,
			action: PayloadAction<{ id: string; changes: ChatConfig }>,
		) => {
			chatAdapter.updateOne(state.chatList, {
				id: action.payload.id,
				changes: action.payload,
			});
		},
	},
});

export const {
	setCurrentChatConfig,
	fetchchatListSuccess,
	fetchDefaultConfig,
	reloadChatList,
	updateChatConfig,
} = chatSlice.actions;

export default chatSlice.reducer;
export const selectChat = (state: RootState) => state.chat;
