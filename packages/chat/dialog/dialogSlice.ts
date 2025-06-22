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
import { streamCybotId } from "ai/cybot/cybotSlice";
import { DialogInvocationMode, DialogConfig } from "app/types";

// 从新的 planSlice 导入 action
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

// Plan 相关的 State 已经被移除
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
    // Plan 相关的 reducers 和 thunks 已被移除
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
        // 在初始化对话时，同时清理 dialog 和 plan 的状态
        dispatch(DialogSlice.actions.clearPendingAttachments());
        dispatch(clearPlan()); // <-- 调用从 planSlice 导入的 action
        const action = await dispatch(read(id));
        return { ...action.payload };
      },
      {
        pending: (state, action) => {
          state.currentDialogKey = action.meta.arg;
          state.currentDialogTokens = { inputTokens: 0, outputTokens: 0 };
          // Plan 相关的 state 初始化已移至 clearPlan action 中
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
        dispatch(clearPlan()); // <-- 调用从 planSlice 导入的 action
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
      // Plan 相关的 state 清理已移至 clearPlan action 中
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
    streamAllCybotsInParallel: create.asyncThunk(
      async (args: { cybotIds: string[]; userInput: string }, { dispatch }) => {
        const { cybotIds, userInput } = args;
        const cybotPromises = cybotIds.map((cybotId) =>
          dispatch(streamCybotId({ cybotId, userInput }))
            .unwrap()
            .catch((error) =>
              console.error(
                `Error in PARALLEL mode for cybot ${cybotId}:`,
                error
              )
            )
        );
        await Promise.all(cybotPromises);
      }
    ),
    orchestrateCybotResponse: create.asyncThunk(
      async (
        args: { dialogConfig: DialogConfig; userInput: string },
        { dispatch }
      ) => {
        const { dialogConfig, userInput } = args;
        const { mode = DialogInvocationMode.FIRST, cybots = [] } = dialogConfig;

        if (mode === DialogInvocationMode.PARALLEL) {
          await dispatch(
            DialogSlice.actions.streamAllCybotsInParallel({
              cybotIds: cybots,
              userInput,
            })
          );
        } else if (mode === DialogInvocationMode.SEQUENTIAL) {
          for (const cybotId of cybots) {
            await dispatch(streamCybotId({ cybotId, userInput })).unwrap();
          }
        } else if (cybots.length > 0) {
          await dispatch(
            streamCybotId({ cybotId: cybots[0], userInput })
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
    // `runPlanSteps` thunk 已被移除
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
        fulfilled: (state, action) => {
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
  streamAllCybotsInParallel,
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

// Plan 相关的 selectors 已被移除
