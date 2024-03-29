import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";

import { Message, MessageSliceState } from "./types";
export const messageSlice = createSlice({
	name: "message",
	initialState: {
		messages: [],
		isStopped: false,
		isMessageStreaming: false,
		tempMessage: {},
	},
	reducers: {
		sendMessage: (state: MessageSliceState, action: PayloadAction<Message>) => {
			const message = action.payload;
			state.messages.push(message);
		},
		startMessage: (state: MessageSliceState) => {
			state.tempMessage = {
				role: "assistant",
				content: "loading",
				id: nanoid(),
			};
			state.isMessageStreaming = true;
		},
		receiveMessage: (
			state: MessageSliceState,
			action: PayloadAction<Message>,
		) => {
			state.messages.push(action.payload);
			state.tempMessage = {};
		},
		clearMessages: (state: MessageSliceState) => {
			// 清除消息
			state.messages = [];
			state.tempMessage = { role: "assistant", content: "", id: nanoid() };
		},
		retry: (state: MessageSliceState) => {
			state.tempMessage = { role: "assistant", content: "", id: nanoid() };
			state.messages.pop();
		},
		messageStreamEnd: (
			state: MessageSliceState,
			action: PayloadAction<Message>,
		) => {
			state.messages.push(action.payload);
			state.tempMessage = { role: "assistant", content: "", id: nanoid() };
			state.isMessageStreaming = false;
		},
		messageStreaming: (
			state: MessageSliceState,
			action: PayloadAction<Message>,
		) => {
			state.tempMessage = action.payload;
			state.isMessageStreaming = true;
		},
		messagesReachedMax: (state: MessageSliceState) => {
			state.isStopped = true;
		},
		continueMessage: (
			state: MessageSliceState,
			action: PayloadAction<Message>,
		) => {
			state.isStopped = false;
			state.messages.push(action.payload);
		},
		messageEnd: (state: MessageSliceState) => {
			state.isMessageStreaming = false;
		},

		deleteMessage: (
			state: MessageSliceState,
			action: PayloadAction<string>,
		) => {
			state.messages = state.messages.filter(
				(message) => message.id !== action.payload,
			);
		},
	},
});

export const {
	sendMessage,
	startMessage,
	receiveMessage,
	clearMessages,
	retry,
	messageStreamEnd,
	messageStreaming,
	messagesReachedMax,
	continueMessage,
	messageEnd,
	deleteMessage,
} = messageSlice.actions;

export default messageSlice.reducer;
