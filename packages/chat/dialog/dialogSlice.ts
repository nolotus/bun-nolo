import {
  type PayloadAction,
  asyncThunkCreator,
  buildCreateSlice,
} from "@reduxjs/toolkit";
import type { NoloRootState } from "app/store";
import { clearCurrentMessages } from "chat/messages/messageSlice";
import { deleteData, read, selectById } from "database/dbSlice";

import { createDialogAction } from "./actions/createDialogAction";
import { updateDialogTitleAction } from "./actions/updateDialogTitleAction";
import { updateTokensAction } from "./actions/updateTokensAction";

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
    // 重命名为通用的 updateTokens
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
      }
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
              })
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
      }
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
      }
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
  resetCurrentDialogTokens,
  updateTokens,
  // 导出 clearDialogState action
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
