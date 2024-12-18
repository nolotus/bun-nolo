import {
	type PayloadAction,
	asyncThunkCreator,
	buildCreateSlice,
} from "@reduxjs/toolkit";
import { extractCustomId } from "core";
import { ollamaHandler } from "integrations/ollama/ollamaHandler";
import { selectCurrentDialogConfig } from "../dialog/dialogSlice";
import type { Message, MessageSliceState } from "./types";

import { createStreamRequestBody } from "ai/chat/createStreamRequestBody";
import { generateIdWithCustomId } from "core/generateMainKey";
import { API_ENDPOINTS } from "database/config";
import { noloRequest } from "database/requests/noloRequest";

import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";
import {
	addToList,
	deleteData,
	read,
	removeFromList,
	upsertOne,
} from "database/dbSlice";
import { filter, reverse } from "rambda";
import { selectCurrentServer } from "setting/settingSlice";
import { ulid } from "ulid";

import { ollamaModelNames } from "integrations/ollama/models";

import { handleOllamaResponse } from "ai/chat/handleOllamaResponse";

import { sendNoloChatRequest } from "./chatStreamRequest";

import { makeAppointment } from "ai/tools/appointment";
import { prepareTools } from "ai/tools/prepareTools";
import { sendMessageAction } from "./actions/sendMessageAction";

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
						state.streamMessages,
					);
				},
			},
		),
		receiveMessage: create.reducer((state, action) => {
			if (!state.ids.includes(action.payload)) {
				state.ids.unshift(action.payload);
			}
		}),

		messageStreaming: create.reducer<Message>((state, action) => {
			const message = action.payload;
			const index = state.streamMessages.findIndex(
				(msg) => msg.id === message.id,
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
		addMessageToServer: create.asyncThunk(
			async (message, thunkApi) => {
				const state = thunkApi.getState();
				const dispatch = thunkApi.dispatch;
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
				const writeMessage = await noloRequest(state, config);
				const saveMessage = await writeMessage.json();
				const dialogConfig = selectCurrentDialogConfig(state);
				const updateId = dialogConfig.messageListId;

				const actionResult = await dispatch(
					addToList({ itemId: saveMessage.id, listId: updateId }),
				);
				console.log("addMessageToServer", actionResult);

				return actionResult.payload;
			},
			{
				rejected: (state, action) => {
					// state.error = action.payload ?? action.error;
				},
				fulfilled: (state, action) => {
					state.ids = reverse(action.payload.array);
				},
			},
		),
		removeMessageFromUI: create.reducer(
			(state, action: PayloadAction<string>) => {
				state.ids = state.ids.filter((id) => id !== action.payload);
			},
		),
		deleteMessage: create.asyncThunk(
			async (messageId: string, thunkApi) => {
				thunkApi.dispatch(removeMessageFromUI(messageId));
				const state = thunkApi.getState();
				const dialogConfig = selectCurrentDialogConfig(state);
				thunkApi.dispatch(
					removeFromList({
						itemId: messageId,
						listId: dialogConfig.messageListId,
					}),
				);
				thunkApi.dispatch(deleteData({ id: messageId }));
			},

			{
				pending: () => {},
				fulfilled: () => {},
			},
		),
		deleteNotFound: create.asyncThunk(
			async (messageId: string, thunkApi) => {
				const dispatch = thunkApi.dispatch;
				const state = thunkApi.getState();
				const dialogConfig = selectCurrentDialogConfig(state);

				dispatch(
					removeFromList({
						itemId: messageId,
						listId: dialogConfig.messageListId,
					}),
				);
				thunkApi.dispatch(removeMessageFromUI(messageId));
			},

			{
				pending: () => {},
				fulfilled: () => {},
			},
		),

		handleSendMessage: create.asyncThunk(sendMessageAction, {
			rejected: (state, action) => {},
			fulfilled: (state, action) => {},
		}),
		clearCurrentMessages: create.reducer((state, action) => {
			state.ids = null;
			state.streamMessages = [];
		}),
		clearCurrentDialog: create.asyncThunk(
			async (args, thunkApi) => {
				const state = thunkApi.getState();
				const dispatch = thunkApi.dispatch;
				const currentDialogConfig = selectCurrentDialogConfig(state);
				const { messageListId } = currentDialogConfig;
				if (messageListId) {
					const body = { ids: state.message.ids };
					const deleteMessageListAction = await dispatch(
						deleteData({
							id: messageListId,
							body,
						}),
					);
				}
			},
			{
				fulfilled: (state, action) => {
					state.ids = [];
					state.streamMessages = [];
				},
			},
		),
		addUserMessage: create.asyncThunk(
			async ({ content, isSaveToServer = true }, thunkApi) => {
				const state = thunkApi.getState();
				const userId = selectCurrentUserId(state);
				const id = generateIdWithCustomId(userId, ulid(), { isJSON: true });
				const dispatch = thunkApi.dispatch;
				const currentDialogConfig = selectCurrentDialogConfig(state);
				const message = {
					id,
					role: "user",
					content,
					belongs: [currentDialogConfig.messageListId],
					userId,
				};
				dispatch(upsertOne(message));
				dispatch(addMessageToUI(message.id));
				if (isSaveToServer) {
					const actionResult = await dispatch(addMessageToServer(message));
					return actionResult.payload;
				}
			},
			{
				pending: () => {},
				rejected: (state, action) => {},
				fulfilled: (state, action) => {
					if (action.payload) {
						state.ids = reverse(action.payload.array);
					}
				},
			},
		),
		addAIMessage: create.asyncThunk(
			async ({ content, id, isSaveToServer = true, cybotId }, thunkApi) => {
				const state = thunkApi.getState();
				const dispatch = thunkApi.dispatch;

				const currentDialogConfig = selectCurrentDialogConfig(state);

				const message = {
					role: "assistant",
					id,
					content,
					belongs: [currentDialogConfig.messageListId],
					cybotId,
				};
				dispatch(upsertOne(message));
				dispatch(addMessageToUI(message.id));
				if (isSaveToServer) {
					const actionResult = await dispatch(addMessageToServer(message));
					return actionResult.payload;
				}
			},
			{
				pending: () => {},
				rejected: (state, action) => {},
				fulfilled: (state, action) => {
					if (action.payload) {
						state.ids = reverse(action.payload.array);
					}
				},
			},
		),

		streamRequest: create.asyncThunk(
			async ({ content, prevMsgs, cybotConfig, signal, id }, thunkApi) => {
				const dispatch = thunkApi.dispatch;
				const state = thunkApi.getState();
				const token = state.auth.currentToken;
				const currentServer = selectCurrentServer(state);
				const cybotId = cybotConfig.id;

				await dispatch(
					addAIMessage({
						content: "loading ...",
						id,
						isSaveToServer: false,
						cybotId,
					}),
				);

				const config = {
					...cybotConfig,
					responseLanguage: navigator.language,
				};

				const requestBody = createStreamRequestBody(config, content, prevMsgs);
				console.log("requestBody", requestBody);
				const response = await sendNoloChatRequest({
					currentServer,
					requestBody: { ...requestBody },
					signal,
					token,
				});
				const reader = response.body.getReader();
				return { reader, id };
			},
			{},
		),
		//for now only use in ollama
		streamLLmId: create.asyncThunk(
			async ({ cybotConfig, prevMsgs, content }, thunkApi) => {
				const dispatch = thunkApi.dispatch;
				const state = thunkApi.getState();
				const controller = new AbortController();
				const signal = controller.signal;
				const cybotId = cybotConfig.id;
				const userId = selectCurrentUserId(state);

				const id = generateIdWithCustomId(userId, ulid(), {
					isJSON: true,
				});
				console.log("cybotConfig", cybotConfig);
				const readLLMAction = await dispatch(read({ id: cybotConfig.llmId }));
				console.log("readLLMAction", readLLMAction);
				const llmConfig = readLLMAction.payload;
				const { api, apiStyle } = llmConfig;
				const model = llmConfig.model;
				const config = {
					...cybotConfig,
					responseLanguage: navigator.language,
				};

				const prepareMsgConfig = {
					model,
					promotMessage: { role: "system", content: config.prompt },
					prevMsgs,
					content,
				};
				const messages = ollamaHandler.prepareMsgs(prepareMsgConfig);
				const tools = prepareTools(cybotConfig.tools);
				const isStream = true;
				const bodyData = {
					model: model,
					messages,
					tools,
					stream: isStream,
				};
				console.log("bodyData", bodyData);

				const body = JSON.stringify(bodyData);
				const result = await fetch(api, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body,
					signal,
				});

				if (result.ok) {
					await handleOllamaResponse(
						id,
						cybotId,
						result,
						thunkApi,
						controller,
						isStream,
						prevMsgs,
						content,
					);
				} else {
					console.error("HTTP-Error:", result.status);
				}
			},
			{},
		),
		//for tool call cybot
		runCybotId: create.asyncThunk(
			async ({ cybotId, prevMsgs, userInput }, thunkApi) => {
				console.log("runCybotId cybotID", cybotId);
				const state = thunkApi.getState();
				const dispatch = thunkApi.dispatch;
				const cybotConfig = await dispatch(read({ id: cybotId })).unwrap();
				console.log("runCybotId cybotConfig", cybotConfig);
				// const readLLMAction = await dispatch(read({ id: cybotConfig.llmId }));
				// const llmConfig = readLLMAction.payload;
				// console.log("runCybotId llmConfig", llmConfig);
				// if (ollamaModelNames.includes(llmConfig.model)) {
				// 	const model = llmConfig.model;
				// 	const prepareMsgConfig = {
				// 		model,
				// 		promotMessage: { role: "system", content: cybotConfig.prompt },
				// 		prevMsgs,
				// 		content: userInput,
				// 	};
				// 	const messages = ollamaHandler.prepareMsgs(prepareMsgConfig);
				// 	const tools = prepareTools(cybotConfig.tools);
				// 	const bodyData = {
				// 		model: model,
				// 		messages,
				// 		tools,
				// 		stream: false,
				// 	};
				// 	const body = JSON.stringify(bodyData);
				// 	const { api, apiStyle } = llmConfig;
				// 	const result = await fetch(api, {
				// 		method: "POST",
				// 		headers: {
				// 			"Content-Type": "application/json",
				// 		},
				// 		body,
				// 		// signal,
				// 	});
				// 	const json = await result.json();
				// 	const message = json.message;
				// 	const cybotTools = message.tool_calls;
				// 	console.log("message", message);
				// 	console.log("cybotTools", cybotTools);
				// 	if (!cybotTools) {
				// 		console.log("direct return");
				// 		return message;
				// 	} else {
				// 		const tool = cybotTools[0].function;
				// 		const toolName = tool.name;
				// 		if (toolName === "make_appointment") {
				// 			const currentUserId = selectCurrentUserId(state);
				// 			console.log("handle tool currentUserId", currentUserId);
				// 			const result = await makeAppointment(
				// 				tool.arguments,
				// 				thunkApi,
				// 				currentUserId,
				// 			);
				// 			console.log("handle tool result", result);
				// 			const message = { content: result };
				// 			return message;
				// 		}
				// 	}
				// }
			},
			{},
		),
		sendWithMessageId: create.asyncThunk(async (messageId, thunkApi) => {
			console.log("messageId", messageId);
			const state = thunkApi.getState();
		}, {}),
	}),
});

export const {
	sendMessage,
	receiveMessage,
	messageStreamEnd,
	messageStreaming,
	messagesReachedMax,
	deleteMessage,
	initMessages,
	removeMessageFromUI,
	deleteNotFound,
	addMessageToUI,
	handleSendMessage,
	clearCurrentMessages,
	clearCurrentDialog,
	addMessageToServer,
	addAIMessage,
	addUserMessage,
	streamRequest,
	streamLLmId,
	sendWithMessageId,
	runCybotId,
} = messageSlice.actions;

export default messageSlice.reducer;
