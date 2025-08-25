// /chat/dialog/dialogSlice.ts

import {
  type PayloadAction,
  asyncThunkCreator,
  buildCreateSlice,
  createSelector,
} from "@reduxjs/toolkit";
import type { RootState } from "app/store";
import { nanoid } from "nanoid";
import { Descendant } from "slate";
import { createPage } from "render/page/pageSlice";
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
import { streamAgentChatTurn } from "ai/cybot/cybotSlice";
import { DialogConfig } from "app/types";
import { clearPlan } from "ai/llm/planSlice";

// 外部 Actions (保持不变)
import { createDialogAction } from "./actions/createDialogAction";
import { updateDialogTitleAction } from "./actions/updateDialogTitleAction";
import { updateTokensAction } from "./actions/updateTokensAction";
import { deleteDialogAction } from "./actions/deleteDialogAction";
import { addCybotAction } from "./actions/addCybotAction";
import { removeCybotAction } from "./actions/removeCybotAction";

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
  groupId?: string; // <--- 改动 1: 增加可选的 groupId
}

export interface CreatePagePayload {
  slateData: Descendant[];
  jsonData?: Record<string, any>[];
  title: string;
  type: "excel" | "docx" | "pdf" | "txt";
  fileId: string; // 从 fileProcessor 传入，用于保持 ID 一致性
  size: number; // 从 fileProcessor 传入
  groupId?: string; // <--- 改动 2: 允许 payload 携带 groupId
}

export interface PendingRawData {
  pageKey: string;
  jsonData: Record<string, any>[];
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
  pendingRawData: Record<string, PendingRawData>;
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
  pendingRawData: {},
};

// --- Slice Definition ---

const dialogSlice = createSliceWithThunks({
  name: "dialog",
  initialState,
  reducers: (create) => ({
    // --- Thunks ---
    createPageAndAddReference: create.asyncThunk(
      async (payload: CreatePagePayload, { dispatch, rejectWithValue }) => {
        // <--- 改动 3: 从 payload 中解构出 fileId 和 groupId
        const { slateData, jsonData, title, type, fileId, groupId } = payload;
        try {
          // 持久化部分只关心富文本内容和标题
          const pageKey = await dispatch(
            createPage({ slateData, title })
          ).unwrap();

          const newReference: PendingFile = {
            id: fileId, // 使用从 fileProcessor 传来的 fileId
            name: title,
            pageKey,
            type,
            groupId, // <--- 改动 4: 将 groupId 存入 newReference 对象
          };
          const newRawData = jsonData ? { pageKey, jsonData } : null;

          // 将引用和原始数据一并返回
          return { reference: newReference, rawData: newRawData };
        } catch (error) {
          console.error("创建页面或引用失败:", error);
          return rejectWithValue((error as Error).message);
        }
      },
      {
        fulfilled: (state, action) => {
          state.pendingFiles.push(action.payload.reference);
          if (action.payload.rawData) {
            state.pendingRawData[action.payload.rawData.pageKey] =
              action.payload.rawData;
          }
        },
      }
    ),
    deleteCurrentDialog: create.asyncThunk(
      async (dialogKey: string, { dispatch, getState }) => {
        const state = getState() as RootState;
        await dispatch(deleteDialog(dialogKey));
        const spaceId = selectCurrentSpaceId(state);
        if (spaceId) {
          await dispatch(
            deleteContentFromSpace({ contentKey: dialogKey, spaceId })
          );
        }
        const dialogId = extractCustomId(dialogKey);
        dispatch(deleteDialogMsgs(dialogId));
        dispatch(dialogSlice.actions.resetCurrentDialogTokens());
        dispatch(dialogSlice.actions.clearPendingAttachments());
        dispatch(clearPlan());
      },
      {
        fulfilled: (state) => {
          state.currentDialogKey = null;
        },
      }
    ),
    initDialog: create.asyncThunk(
      async (id: string, { dispatch, signal }) => {
        dispatch(dialogSlice.actions.clearPendingAttachments());
        dispatch(clearPlan());
        const action = await dispatch(read({ id, signal }));
        return action.payload;
      },
      {
        pending: (state, action) => {
          state.currentDialogKey = action.meta.arg;
          state.currentDialogTokens = { inputTokens: 0, outputTokens: 0 };
        },
        fulfilled: (state, action) => {
          if (state.currentDialogKey === action.meta.arg) {
            // No-op
          }
        },
        rejected: (state, action) => {
          const isAborted =
            action.error.name === "AbortError" ||
            action.error.message === "Aborted";
          const isCurrentDialog = state.currentDialogKey === action.meta.arg;

          if (!isAborted && isCurrentDialog) {
            console.error("Failed to init dialog:", action.error.message);
            state.currentDialogKey = null;
          }
        },
      }
    ),

    handleSendMessage: create.asyncThunk(
      async (
        args: { userInput: string | any[] },
        { dispatch, getState, rejectWithValue }
      ) => {
        const state = getState() as RootState;
        try {
          const dialogConfig = selectCurrentDialogConfig(state);
          if (!dialogConfig)
            throw new Error(
              "handleSendMessage: Current dialog configuration is missing."
            );

          await dispatch(
            prepareAndPersistUserMessage({
              userInput: args.userInput,
              dialogConfig,
            })
          ).unwrap();

          if (dialogConfig.cybots && dialogConfig.cybots.length > 0) {
            await dispatch(
              streamAgentChatTurn({
                cybotId: dialogConfig.cybots[0],
                userInput: args.userInput,
              })
            ).unwrap();
          }
        } catch (error) {
          console.error("handleSendMessage failed:", error);
          return rejectWithValue((error as Error).message);
        }
      }
    ),
    abortAllMessages: create.asyncThunk(
      async (_, { getState, dispatch }) => {
        const controllers = (getState() as RootState).dialog.activeControllers;
        Object.values(controllers).forEach((controller) => controller.abort());
        dispatch(dialogSlice.actions.clearActiveControllers());
      },
      {
        fulfilled: (state) => {
          state.activeControllers = {};
        },
      }
    ),

    // Passthrough thunks for external actions
    updateTokens: create.asyncThunk(updateTokensAction),
    deleteDialog: create.asyncThunk(deleteDialogAction),
    createDialog: create.asyncThunk(createDialogAction),
    updateDialogTitle: create.asyncThunk(updateDialogTitleAction),
    addCybot: create.asyncThunk(addCybotAction),
    removeCybot: create.asyncThunk(removeCybotAction),

    // --- Reducers ---
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
        const fileToRemove = state.pendingFiles.find(
          (f) => f.id === action.payload
        );
        if (fileToRemove) {
          delete state.pendingRawData[fileToRemove.pageKey];
          state.pendingFiles = state.pendingFiles.filter(
            (file) => file.id !== action.payload
          );
        }
      }
    ),
    clearPendingAttachments: create.reducer((state) => {
      state.pendingFiles = [];
    }),
    clearDialogState: create.reducer((state) => {
      state.currentDialogKey = null;
      state.currentDialogTokens = { inputTokens: 0, outputTokens: 0 };
      state.pendingFiles = [];
      state.pendingRawData = {};
    }),
    resetCurrentDialogTokens: create.reducer((state) => {
      state.currentDialogTokens = { inputTokens: 0, outputTokens: 0 };
    }),
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
    clearActiveControllers: create.reducer((state) => {
      state.activeControllers = {};
    }),
  }),

  // --- Selectors ---
  selectors: {
    selectCurrentDialogKey: (state) => state.currentDialogKey,
    selectIsUpdatingMode: (state) => state.isUpdatingMode,
    selectPendingFiles: (state) => state.pendingFiles,
    selectActiveControllers: (state) => state.activeControllers,
    selectPendingRawData: (state) => state.pendingRawData,
    selectTotalDialogTokens: (state) =>
      state.currentDialogTokens.inputTokens +
      state.currentDialogTokens.outputTokens,

    selectPendingRawDataByPageKey: (
      state,
      pageKey: string
    ): PendingRawData | undefined => state.pendingRawData[pageKey],
  },
});

// --- Actions and Reducer Exports ---
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
  handleSendMessage,
  addActiveController,
  removeActiveController,
  abortAllMessages,
  clearActiveControllers,
} = dialogSlice.actions;

export default dialogSlice.reducer;

// --- Selectors Exports ---
export const {
  selectCurrentDialogKey,
  selectIsUpdatingMode,
  selectPendingFiles,
  selectActiveControllers,
  selectPendingRawData,
  selectTotalDialogTokens,
  selectPendingRawDataByPageKey,
} = dialogSlice.selectors;

export const selectCurrentDialogConfig = createSelector(
  (state: RootState) => state,
  selectCurrentDialogKey,
  (state, currentDialogKey) =>
    currentDialogKey
      ? (selectById(state, currentDialogKey) as DialogConfig | null)
      : null
);
