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
import { streamAgentChatTurn } from "ai/cybot/cybotSlice";
import { DialogConfig } from "app/types";
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

// [修改] CreatePageFromSlatePayload 更名为 CreatePagePayload 并增加 jsonData
export interface CreatePagePayload {
  slateData: Descendant[];
  jsonData?: Record<string, any>[]; // jsonData 是可选的
  title: string;
  type: "excel" | "docx" | "pdf" | "txt";
}

// [新增] 用于暂存原始数据的接口
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
  // [新增] 暂存原始数据的字段
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
  // [新增] 初始化
  pendingRawData: {},
};

// --- Slice Definition ---

const DialogSlice = createSliceWithThunks({
  name: "dialog",
  initialState,
  reducers: (create) => ({
    // [修改] createPageAndAddReference Thunk
    createPageAndAddReference: create.asyncThunk(
      async (payload: CreatePagePayload, { dispatch, rejectWithValue }) => {
        const { slateData, jsonData, title, type } = payload;
        try {
          // 数据库部分只关心 slateData 和 title
          const pageKey = await dispatch(
            createPage({ slateData, title })
          ).unwrap();

          const newReference: PendingFile = {
            id: nanoid(),
            name: title,
            pageKey,
            type,
          };

          // 如果有 jsonData，则准备好 rawData 对象
          const newRawData = jsonData ? { pageKey, jsonData } : null;

          return { reference: newReference, rawData: newRawData };
        } catch (error) {
          console.error("创建页面或引用失败:", error);
          return rejectWithValue((error as Error).message);
        }
      },
      {
        fulfilled: (state, action) => {
          // 同时更新 pendingFiles 和 pendingRawData
          state.pendingFiles.push(action.payload.reference);
          if (action.payload.rawData) {
            state.pendingRawData[action.payload.rawData.pageKey] =
              action.payload.rawData;
          }
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
    // [修改] removePendingFile 需要同时清理 rawData
    removePendingFile: create.reducer(
      (state, action: PayloadAction<string>) => {
        // payload is id
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
    // [修改] clearPendingAttachments 需要同时清理 rawData
    clearPendingAttachments: create.reducer((state) => {
      state.pendingFiles = [];
      state.pendingRawData = {};
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
      state.pendingRawData = {}; // [修改] 清理
    }),
    createDialog: create.asyncThunk(createDialogAction),
    updateDialogTitle: create.asyncThunk(updateDialogTitleAction),
    addCybot: create.asyncThunk(addCybotAction),
    removeCybot: create.asyncThunk(removeCybotAction),

    orchestrateCybotResponse: create.asyncThunk(
      async (
        args: { dialogConfig: DialogConfig; userInput: string | any[] },
        { dispatch }
      ) => {
        const { dialogConfig, userInput } = args;
        const { cybots = [] } = dialogConfig;

        if (cybots.length > 0) {
          await dispatch(
            streamAgentChatTurn({ cybotId: cybots[0], userInput })
          ).unwrap();
        }
      }
    ),
    handleSendMessage: create.asyncThunk(
      async (
        args: { userInput: string | any[] },
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
  // [新增] 在 selectors 中导出新状态
  selectors: {
    selectPendingRawDataByPageKey: (
      state,
      pageKey: string
    ): PendingRawData | undefined => state.pendingRawData[pageKey],
  },
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
  handleSendMessage,
  addActiveController,
  removeActiveController,
  abortAllMessages,
  clearActiveControllers,
} = DialogSlice.actions;

// [新增] 导出新的 selector
export const { selectPendingRawDataByPageKey } = DialogSlice.selectors;

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
