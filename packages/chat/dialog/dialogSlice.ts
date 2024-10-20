import {
  PayloadAction,
  buildCreateSlice,
  asyncThunkCreator,
} from "@reduxjs/toolkit";
import { NoloRootState } from "app/store";
import { deleteData, read, removeOne } from "database/dbSlice";
import { write } from "database/dbSlice";

import { DataType } from "create/types";
import { nolotusId } from "core/init";

import { clearMessages } from "../messages/messageSlice";

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
    currentDialogConfig: null,
    currentDialogTokens: {
      inputTokens: 0,
      outputTokens: 0,
    },
  },
  reducers: (create) => ({
    setCurrentDialogId: create.reducer(
      (state, action: PayloadAction<string>) => {
        state.currentDialogId = action.payload;
      },
    ),
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
        dispatch(setCurrentDialogId(dialogId));
        dispatch(resetCurrentDialogTokens());
        const action = await dispatch(read({ id: dialogId }));
        return { ...action.payload, source };
      },
      {
        pending: (state) => {
          state.currentDialogConfig = null;
        },
        rejected: (state, action) => {},
        fulfilled: (state, action) => {
          state.currentDialogConfig = action.payload;
        },
      },
    ),
    deleteDialog: create.asyncThunk(
      async (dialogId, thunkApi) => {
        const { dispatch, getState } = thunkApi;
        dispatch(removeOne(dialogId));
        const state = getState();
        const action = await dispatch(read({ id: dialogId }));
        const dialog = action.payload;
        const deleteConfig = { id: dialogId };
        if (dialog.messageListId) {
          const body = { ids: state.message.ids };
          const deleteMesssagListAction = await dispatch(
            deleteData({
              id: dialog.messageListId,
              body,
            }),
          );
          await dispatch(deleteData(deleteConfig));
        } else {
          await dispatch(deleteData(deleteConfig));
        }
      },
      {
        fulfilled: (state) => {
          state.currentDialogConfig = null;
          state.currentDialogId = null;
        },
      },
    ),
    deleteCurrentDialog: create.asyncThunk(
      async (dialog, thunkApi) => {
        const { dispatch, getState } = thunkApi;
        const state = getState();
        dispatch(removeOne(dialog.id));
        dispatch(clearMessages());
        dispatch(resetCurrentDialogTokens());
        const deleteConfig = { id: dialog.id, source: dialog.source };

        if (dialog.messageListId) {
          const body = { ids: state.message.ids };
          const deleteMesssagListAction = await dispatch(
            deleteData({
              id: dialog.messageListId,
              body,
              source: dialog.source,
            }),
          );
          await dispatch(deleteData(deleteConfig));
        } else {
          await dispatch(deleteData(deleteConfig));
        }
      },
      {
        fulfilled: (state) => {
          state.currentDialogConfig = null;
          state.currentDialogId = null;
        },
      },
    ),
    // 清空数据
    clearDialogState: create.reducer((state) => {
      state.currentDialogId = null;
      state.currentDialogConfig = null;
      state.currentDialogTokens = { inputTokens: 0, outputTokens: 0 };
    }),
  }),
});

export const {
  initDialog,
  setCurrentDialogId,
  deleteDialog,
  deleteCurrentDialog,
  updateInputTokens,
  updateOutputTokens,
  resetCurrentDialogTokens,
  // 导出 clearDialogState action
  clearDialogState,
} = DialogSlice.actions;

export default DialogSlice.reducer;

export const selectCurrentDialogConfig = (state: NoloRootState) =>
  state.dialog.currentDialogConfig;

export const selectCurrentDialogTokens = (state: NoloRootState): TokenUsage =>
  state.dialog.currentDialogTokens;

export const selectTotalDialogTokens = (state: NoloRootState): number =>
  state.dialog.currentDialogTokens.inputTokens +
  state.dialog.currentDialogTokens.outputTokens;
