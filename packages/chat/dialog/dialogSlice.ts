import {
	type PayloadAction,
	asyncThunkCreator,
	buildCreateSlice,
} from "@reduxjs/toolkit";
import type { NoloRootState } from "app/store";
import { clearCurrentMessages } from "chat/messages/messageSlice";
import { deleteData, read, selectById, write } from "database/dbSlice";

import { nolotusId } from "core/init";
import { DataType } from "create/types";
import { createDialogAction } from "./actions/createDialogAction";
import { updateDialogTitleAction } from "./actions/updateDialogTitleAction";

const createSliceWithThunks = buildCreateSlice({
	creators: { asyncThunk: asyncThunkCreator },
});

interface TokenUsage {
	inputTokens: number;
	outputTokens: number;
}

const DialogSlice = createSliceWithThunks({
	name: "chat",
	initialState: {
		currentDialogId: null,
		currentDialogTokens: {
			inputTokens: 0,
			outputTokens: 0,
		},
	},
	reducers: (create) => ({
		updateInputTokens: create.asyncThunk(
			async (tokenCount: number, thunkApi) => {
				const { dispatch } = thunkApi;
				const state = thunkApi.getState();
				const auth = state.auth;
				const config = selectCurrentDialogConfig(state);
				const model = config.model ? config.model : "xx";
				const staticData = {
					messageType: "send",
					model,
					tokenCount,
					userId: auth?.user?.userId,
					username: auth?.user?.username,
					date: new Date(),
				};

				await dispatch(
					write({
						data: {
							...staticData,
							type: DataType.TokenStats,
						},
						flags: { isJSON: true },
						userId: nolotusId,
					}),
				);
				return tokenCount;
			},
			{
				fulfilled: (state, action: PayloadAction<number>) => {
					state.currentDialogTokens.inputTokens += action.payload;
				},
			},
		),
		updateOutputTokens: create.asyncThunk(
			async (tokenCount: number, thunkApi) => {
				const { dispatch, getState } = thunkApi;
				const state = getState() as NoloRootState;
				const auth = state.auth;
				const config = selectCurrentDialogConfig(state);
				const model = config?.model || "xx";

				const staticData = {
					messageType: "receive",
					model,
					tokenCount,
					userId: auth?.user?.userId,
					username: auth?.user?.username,
					date: new Date(),
				};

				await dispatch(
					write({
						data: {
							...staticData,
							type: DataType.TokenStats,
						},
						flags: { isJSON: true },
						userId: nolotusId,
					}),
				);

				return tokenCount;
			},
			{
				fulfilled: (state, action: PayloadAction<number>) => {
					state.currentDialogTokens.outputTokens += action.payload;
				},
			},
		),
		resetCurrentDialogTokens: create.reducer((state) => {
			state.currentDialogTokens = { inputTokens: 0, outputTokens: 0 };
		}),
		initDialog: create.asyncThunk(
			async (args, thunkApi) => {
				const { dialogId, source } = args;
				const { dispatch } = thunkApi;
				const action = await dispatch(read({ id: dialogId }));
				return { ...action.payload, source };
			},
			{
				pending: (state) => {
					state.currentDialogId = null;
				},
				rejected: (state, action) => {},
				fulfilled: (state, action) => {
					state.currentDialogId = action.payload.id;
				},
			},
		),
		deleteDialog: create.asyncThunk(
			async (dialogId, thunkApi) => {
				const { dispatch, getState } = thunkApi;

				const state = getState();
				try {
					const action = await dispatch(read({ id: dialogId }));
					const dialog = action.payload;

					if (dialog && dialog.messageListId) {
						const body = { ids: state.message.ids };
						const deleteMessageListAction = await dispatch(
							deleteData({
								id: dialog.messageListId,
								body,
							}),
						);
					}
				} catch (error) {
					console.error("Error reading dialog:", error);
				} finally {
					dispatch(deleteData({ id: dialogId }));
				}
			},
			{
				fulfilled: (state) => {
					state.currentDialogId = null;
				},
			},
		),
		deleteCurrentDialog: create.asyncThunk(
			async (dialogId, thunkApi) => {
				const dispatch = thunkApi.dispatch;
				dispatch(deleteDialog(dialogId));
				dispatch(clearCurrentMessages());
				dispatch(resetCurrentDialogTokens());
			},
			{
				fulfilled: (state, action) => {},
			},
		),

		// 清空数据
		clearDialogState: create.reducer((state) => {
			state.currentDialogId = null;
			state.currentDialogTokens = { inputTokens: 0, outputTokens: 0 };
		}),
		createDialog: create.asyncThunk(createDialogAction, {}),
		updateDialogTitle: create.asyncThunk(updateDialogTitleAction, {}),
	}),
});

export const {
	initDialog,
	deleteDialog,
	updateInputTokens,
	updateOutputTokens,
	resetCurrentDialogTokens,
	// 导出 clearDialogState action
	clearDialogState,
	deleteCurrentDialog,
	createDialog,
	updateDialogTitle,
} = DialogSlice.actions;

export default DialogSlice.reducer;

export const selectCurrentDialogConfig = (state: NoloRootState) =>
	selectById(state, state.dialog.currentDialogId);

export const selectCurrentDialogTokens = (state: NoloRootState): TokenUsage =>
	state.dialog.currentDialogTokens;

export const selectTotalDialogTokens = (state: NoloRootState): number =>
	state.dialog.currentDialogTokens.inputTokens +
	state.dialog.currentDialogTokens.outputTokens;
