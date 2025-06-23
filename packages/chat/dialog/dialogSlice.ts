// /chat/dialog/dialogSlice.ts

import {
  type PayloadAction,
  asyncThunkCreator,
  buildCreateSlice,
} from "@reduxjs/toolkit";
import type { RootState } from "app/store";
import { nanoid } from "nanoid";
import { createPage } from "render/page/pageSlice";
import { Descendant } from "slate";
import {
  deleteDialogMsgs,
  prepareAndPersistUserMessage,
} from "chat/messages/messageSlice";
import { extractCustomId } from "core/prefix";
import { read, selectById } from "database/dbSlice";
import {
  deleteContentFromSpace,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";
import { createDialogAction } from "./actions/createDialogAction";
import { updateDialogTitleAction } from "./actions/updateDialogTitleAction";
import { updateTokensAction } from "./actions/updateTokensAction";
import { deleteDialogAction } from "./actions/deleteDialogAction";
import { addCybotAction } from "./actions/addCybotAction";
import { removeCybotAction } from "./actions/removeCybotAction";
import { updateDialogModeAction } from "./actions/updateDialogModeAction";
import { streamAgentChatTurn } from "ai/cybot/cybotSlice";
import { DialogConfig } from "app/types"; // DialogInvocationMode is no longer used here
import { clearPlan } from "ai/llm/planSlice";

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

// --- Interfaces ---

interface TokenMetrics {
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  output_tokens: number;
  input_tokens: number;
}

export interface PendingFile {
  id: string;
  name: string;
  pageKey: string;
  type: "excel" | "docx" | "pdf" | "page" | "txt";
}

export interface CreatePageFromSlatePayload {
  slateData: Descendant[];
  title: string;
  type: "excel" | "docx" | "pdf" | "txt";
}

interface DialogState {
  currentDialogKey: string | null;
  currentDialogTokens: {
    inputTokens: number;
    outputTokens: number;
  };
  isUpdatingMode: boolean;
  pendingFiles: PendingFile[];
  activeControllers: Record<string, AbortController>;
}

// --- Initial State ---

const initialState: DialogState = {
  currentDialogKey: null,
  currentDialogTokens: {
    inputTokens: 0,
    outputTokens: 0,
  },
  isUpdatingMode: false,
  pendingFiles: [],
  activeControllers: {},
};

// --- Slice Definition ---

const DialogSlice = createSliceWithThunks({
  name: "dialog",
  initialState,
  reducers: (create) => ({
    createPageAndAddReference: create.asyncThunk(
      async (
        payload: CreatePageFromSlatePayload,
        { dispatch, rejectWithValue }
      ) => {
        const { slateData, title, type } = payload;
        try {
          const pageKey = await dispatch(
            createPage({ slateData, title })
          ).unwrap();
          const newReference: PendingFile = {
            id: nanoid(),
            name: title,
            pageKey,
            type,
          };
          return newReference;
        } catch (error) {
          console.error("创建页面或引用失败:", error);
          return rejectWithValue((error as Error).message);
        }
      },
      {
        fulfilled: (state, action: PayloadAction<PendingFile>) => {
          state.pendingFiles.push(action.payload);
        },
      }
    ),
    addPendingFile: create.reducer(
      (state, action: PayloadAction<PendingFile>) => {
        if (
          !state.pendingFiles.some((f) => f.pageKey === action.payload.pageKey)
        ) {
          state.pendingFiles.push(action.payload);
        }
      }
    ),
    removePendingFile: create.reducer(
      (state, action: PayloadAction<string>) => {
        state.pendingFiles = state.pendingFiles.filter(
          (file) => file.id !== action.payload
        );
      }
    ),
    clearPendingAttachments: create.reducer((state) => {
      state.pendingFiles = [];
    }),
    updateTokens: create.asyncThunk(updateTokensAction, {
      fulfilled: (state, action: PayloadAction<TokenMetrics>) => {
        if (action.payload.input_tokens)
          state.currentDialogTokens.inputTokens += action.payload.input_tokens;
        if (action.payload.output_tokens)
          state.currentDialogTokens.outputTokens +=
            action.payload.output_tokens;
      },
    }),
    resetCurrentDialogTokens: create.reducer((state) => {
      state.currentDialogTokens = { inputTokens: 0, outputTokens: 0 };
    }),
    initDialog: create.asyncThunk(
      async (id: string, { dispatch }) => {
        dispatch(DialogSlice.actions.clearPendingAttachments());
        dispatch(clearPlan());
        const action = await dispatch(read(id));
        return { ...action.payload };
      },
      {
        pending: (state, action) => {
          state.currentDialogKey = action.meta.arg;
          state.currentDialogTokens = { inputTokens: 0, outputTokens: 0 };
        },
      }
    ),
    deleteDialog: create.asyncThunk(deleteDialogAction),
    deleteCurrentDialog: create.asyncThunk(
      async (dialogKey, thunkApi) => {
        const { dispatch, getState } = thunkApi;
        const state = getState() as RootState;
        dispatch(deleteDialog(dialogKey));
        const spaceId = selectCurrentSpaceId(state);
        if (spaceId) {
          dispatch(deleteContentFromSpace({ contentKey: dialogKey, spaceId }));
        }
        const dialogId = extractCustomId(dialogKey);
        dispatch(deleteDialogMsgs(dialogId));
        dispatch(resetCurrentDialogTokens());
        dispatch(DialogSlice.actions.clearPendingAttachments());
        dispatch(clearPlan());
      },
      {
        fulfilled: (state) => {
          state.currentDialogKey = null;
        },
      }
    ),
    clearDialogState: create.reducer((state) => {
      state.currentDialogKey = null;
      state.currentDialogTokens = { inputTokens: 0, outputTokens: 0 };
      state.pendingFiles = [];
    }),
    createDialog: create.asyncThunk(createDialogAction),
    updateDialogTitle: create.asyncThunk(updateDialogTitleAction),
    addCybot: create.asyncThunk(addCybotAction),
    removeCybot: create.asyncThunk(removeCybotAction),
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
    // The parallel thunk `streamAllCybotsInParallel` has been removed.

    // `orchestrateCybotResponse` is now simplified to only run the first cybot.
    orchestrateCybotResponse: create.asyncThunk(
      async (
        args: { dialogConfig: DialogConfig; userInput: string },
        { dispatch }
      ) => {
        const { dialogConfig, userInput } = args;
        const { cybots = [] } = dialogConfig;

        // Always stream the first available cybot. No more mode checks.
        if (cybots.length > 0) {
          await dispatch(
            streamAgentChatTurn({ cybotId: cybots[0], userInput })
          ).unwrap();
        }
      }
    ),
    handleSendMessage: create.asyncThunk(
      async (
        args: { userInput: string },
        { dispatch, getState, rejectWithValue }
      ) => {
        const { userInput } = args;
        const state = getState() as RootState;
        try {
          const dialogConfig = selectCurrentDialogConfig(state);
          if (!dialogConfig)
            throw new Error(
              "handleSendMessage: Current dialog configuration is missing."
            );
          await dispatch(
            prepareAndPersistUserMessage({ userInput, dialogConfig })
          ).unwrap();
          await dispatch(
            DialogSlice.actions.orchestrateCybotResponse({
              dialogConfig,
              userInput,
            })
          );
        } catch (error) {
          console.error("handleSendMessage failed:", error);
          return rejectWithValue((error as Error).message);
        }
      }
    ),
    addActiveController: create.reducer(
      (
        state,
        action: PayloadAction<{
          messageId: string;
          controller: AbortController;
        }>
      ) => {
        state.activeControllers[action.payload.messageId] =
          action.payload.controller;
      }
    ),
    removeActiveController: create.reducer(
      (state, action: PayloadAction<string>) => {
        delete state.activeControllers[action.payload];
      }
    ),
    abortAllMessages: create.asyncThunk(
      async (_, { dispatch, getState }) => {
        const state = getState() as RootState;
        const controllers = state.dialog.activeControllers;
        Object.values(controllers).forEach((controller) => {
          try {
            controller.abort();
          } catch (e) {
            console.error("中止控制器失败:", e);
          }
        });
        dispatch(DialogSlice.actions.clearActiveControllers());
        return { abortedCount: Object.keys(controllers).length };
      },
      {
        fulfilled: (state) => {
          state.activeControllers = {};
        },
      }
    ),
    clearActiveControllers: create.reducer((state) => {
      state.activeControllers = {};
    }),
  }),
});

// --- Actions & Selectors Exports ---
export const {
  createPageAndAddReference,
  addPendingFile,
  removePendingFile,
  clearPendingAttachments,
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
  handleSendMessage,
  addActiveController,
  removeActiveController,
  abortAllMessages,
  clearActiveControllers,
  // streamAllCybotsInParallel has been removed from exports.
} = DialogSlice.actions;

export default DialogSlice.reducer;

export const selectCurrentDialogConfig = (state: RootState) =>
  state.dialog.currentDialogKey
    ? (selectById(state, state.dialog.currentDialogKey) as DialogConfig | null)
    : null;
export const selectCurrentDialogKey = (state: RootState) =>
  state.dialog.currentDialogKey;
export const selectTotalDialogTokens = (state: RootState): number =>
  state.dialog.currentDialogTokens.inputTokens +
  state.dialog.currentDialogTokens.outputTokens;
export const selectIsUpdatingMode = (state: RootState): boolean =>
  state.dialog.isUpdatingMode;
export const selectPendingFiles = (state: RootState): PendingFile[] =>
  state.dialog.pendingFiles;
export const selectActiveControllers = (
  state: RootState
): Record<string, AbortController> => state.dialog.activeControllers;
