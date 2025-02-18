import {
  type PayloadAction,
  asyncThunkCreator,
  buildCreateSlice,
} from "@reduxjs/toolkit";
import type { NoloRootState } from "app/store";
import { deleteDialogMsgs } from "chat/messages/messageSlice";
import { read, selectById } from "database/dbSlice";

import { createDialogAction } from "./actions/createDialogAction";
import { updateDialogTitleAction } from "./actions/updateDialogTitleAction";
import { updateTokensAction } from "./actions/updateTokensAction";
import { extractCustomId } from "core/prefix";
import { deleteDialogAction } from "./actions/deleteDialogAction";
import {
  deleteContentFromSpace,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

interface TokenMetrics {
  cache_creation_input_tokens: number; // 缓存创建的输入token
  cache_read_input_tokens: number; // 缓存读取的输入token
  output_tokens: number; // 输出token
  input_tokens: number; // 输入token
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
    updateTokens: create.asyncThunk(updateTokensAction, {
      fulfilled: (state, action: PayloadAction<TokenMetrics>) => {
        // 分别更新输入和输出token
        if (action.payload.input_tokens) {
          state.currentDialogTokens.inputTokens += action.payload.input_tokens;
        }
        if (action.payload.output_tokens) {
          state.currentDialogTokens.outputTokens +=
            action.payload.output_tokens;
        }
      },
    }),

    resetCurrentDialogTokens: create.reducer((state) => {
      state.currentDialogTokens = { inputTokens: 0, outputTokens: 0 };
    }),
    initDialog: create.asyncThunk(
      async (id, thunkApi) => {
        const { dispatch } = thunkApi;
        const action = await dispatch(read(id));
        return { ...action.payload };
      },
      {
        pending: (state, action) => {
          state.currentDialogId = action.meta.arg;
        },
      }
    ),
    deleteDialog: create.asyncThunk(deleteDialogAction, {
      fulfilled: (state) => {
        state.currentDialogId = null;
      },
    }),
    deleteCurrentDialog: create.asyncThunk(
      async (dialogKey, thunkApi) => {
        const dispatch = thunkApi.dispatch;
        const state = thunkApi.getState();
        dispatch(deleteDialog(dialogKey));
        const spaceId = selectCurrentSpaceId(state);
        dispatch(deleteContentFromSpace({ contentKey: dialogKey, spaceId }));
        const dialogId = extractCustomId(dialogKey);
        dispatch(deleteDialogMsgs(dialogId));
        dispatch(resetCurrentDialogTokens());
      },
      {
        fulfilled: (state, action) => {},
      }
    ),

    // 清空数据
    clearDialogState: create.reducer((state) => {
      state.currentDialogId = null;
      state.currentDialogTokens = { inputTokens: 0, outputTokens: 0 };
    }),
    createDialog: create.asyncThunk(createDialogAction),
    updateDialogTitle: create.asyncThunk(updateDialogTitleAction),
  }),
});

export const {
  initDialog,
  deleteDialog,
  resetCurrentDialogTokens,
  updateTokens,
  clearDialogState,
  deleteCurrentDialog,
  createDialog,
  updateDialogTitle,
} = DialogSlice.actions;

export default DialogSlice.reducer;

export const selectCurrentDialogConfig = (state: NoloRootState) =>
  selectById(state, state.dialog.currentDialogId);

export const selectTotalDialogTokens = (state: NoloRootState): number =>
  state.dialog.currentDialogTokens.inputTokens +
  state.dialog.currentDialogTokens.outputTokens;
