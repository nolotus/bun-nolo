import {
	createSlice,
	PayloadAction,
	createEntityAdapter,
} from "@reduxjs/toolkit";
import { RootState } from "app/store";

import { ChatConfig } from "./types";

export type ChatSliceState = {
	chatList: ReturnType<typeof chatAdapter.getInitialState>;
	currentChatId: string | null;
};

export const chatAdapter = createEntityAdapter<ChatConfig>({
	// Assume IDs are stored in the 'id' field of each chat config
	selectId: (chat) => chat.id,
});
export const {
	selectAll: selectAllChats,
	selectById: selectChatById, // 新添加的按ID选择实体的选择器
	// 可以继续添加其他需要的选择器，例如 selectIds, selectEntities, selectTotal
} = chatAdapter.getSelectors((state: RootState) => state.chat.chatList);

export const chatSlice = createSlice({
	name: "chat",
	initialState: {
		currentChatId: null,
		chatList: chatAdapter.getInitialState(),
	},
	reducers: {
		fetchChatListSuccess: (
			state: ChatSliceState,
			action: PayloadAction<any[]>,
		) => {
			chatAdapter.upsertMany(state.chatList, action.payload);
			if (!state.currentChatId) {
				state.currentChatId = action.payload[0].id
					? action.payload[0].id
					: null;
			}
		},

		fetchDefaultConfig: (
			state: ChatSliceState,
			action: PayloadAction<ChatConfig>,
		) => {
			state.currentChatId = action.payload.id;
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
	fetchChatListSuccess,
	fetchDefaultConfig,
	reloadChatList,
	updateChatConfig,
} = chatSlice.actions;

export default chatSlice.reducer;
export const selectChat = (state: RootState) => state.chat;
