import {
  type PayloadAction,
  asyncThunkCreator,
  buildCreateSlice,
} from "@reduxjs/toolkit";
import type { NoloRootState } from "app/store";
import { deleteDialogMsgs } from "chat/messages/messageSlice";
import { read, selectById, patch } from "database/dbSlice";
import { extractCustomId } from "core/prefix";
import {
  deleteContentFromSpace,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";
import { DialogInvocationMode } from "chat/dialog/types";
import { createDialogAction } from "./actions/createDialogAction";
import { updateDialogTitleAction } from "./actions/updateDialogTitleAction";
import { updateTokensAction } from "./actions/updateTokensAction";
import { deleteDialogAction } from "./actions/deleteDialogAction";
import { addCybotAction } from "./actions/addCybotAction";
import { removeCybotAction } from "./actions/removeCybotAction";
import { updateDialogModeAction } from "./actions/updateDialogModeAction";

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

interface TokenMetrics {
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  output_tokens: number;
  input_tokens: number;
}

const DialogSlice = createSliceWithThunks({
  name: "chat",
  initialState: {
    currentDialogKey: null,
    currentDialogTokens: {
      inputTokens: 0,
      outputTokens: 0,
    },
    isUpdatingMode: false,
  },
  reducers: (create) => ({
    updateTokens: create.asyncThunk(updateTokensAction, {
      fulfilled: (state, action: PayloadAction<TokenMetrics>) => {
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
          state.currentDialogKey = action.meta.arg;
        },
      }
    ),

    deleteDialog: create.asyncThunk(deleteDialogAction, {
      fulfilled: (state) => {
        state.currentDialogKey = null;
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

    clearDialogState: create.reducer((state) => {
      state.currentDialogKey = null;
      state.currentDialogTokens = { inputTokens: 0, outputTokens: 0 };
    }),

    createDialog: create.asyncThunk(createDialogAction),

    updateDialogTitle: create.asyncThunk(updateDialogTitleAction),

    addCybot: create.asyncThunk(addCybotAction, {
      fulfilled: (state, action) => {},
    }),

    removeCybot: create.asyncThunk(removeCybotAction, {
      fulfilled: (state, action) => {},
    }),

    updateDialogMode: create.asyncThunk(updateDialogModeAction, {
      pending: (state) => {
        state.isUpdatingMode = true;
      },
      fulfilled: (state) => {
        state.isUpdatingMode = false;
      },
      rejected: (state) => {
        state.isUpdatingMode = false;
      },
    }),
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
  addCybot,
  removeCybot,
  updateDialogMode,
} = DialogSlice.actions;

export default DialogSlice.reducer;

export const selectCurrentDialogConfig = (state: NoloRootState) =>
  selectById(state, state.dialog.currentDialogKey);

export const selectCurrentDialogKey = (state: NoloRootState) =>
  state.dialog.currentDialogKey;

export const selectTotalDialogTokens = (state: NoloRootState): number =>
  state.dialog.currentDialogTokens.inputTokens +
  state.dialog.currentDialogTokens.outputTokens;

export const selectIsUpdatingMode = (state: NoloRootState): boolean =>
  state.dialog.isUpdatingMode;
