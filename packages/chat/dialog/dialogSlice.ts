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

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

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
        rejected: (state, action) => {
          console.error("createPageAndAddReference rejected:", action.payload);
        },
      }
    ),

    addPendingFile: create.reducer(
      (state, action: PayloadAction<PendingFile>) => {
        const isAlreadyAdded = state.pendingFiles.some(
          (file) => file.pageKey === action.payload.pageKey
        );
        if (!isAlreadyAdded) {
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
        dispatch(DialogSlice.actions.clearPendingAttachments());
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
    deleteDialog: create.asyncThunk(deleteDialogAction, {
      fulfilled: (state) => {},
    }),
    deleteCurrentDialog: create.asyncThunk(
      async (dialogKey, thunkApi) => {
        const dispatch = thunkApi.dispatch;
        const state = thunkApi.getState() as RootState;
        dispatch(deleteDialog(dialogKey));
        const spaceId = selectCurrentSpaceId(state);
        if (spaceId) {
          dispatch(deleteContentFromSpace({ contentKey: dialogKey, spaceId }));
        }
        const dialogId = extractCustomId(dialogKey);
        dispatch(deleteDialogMsgs(dialogId));
        dispatch(resetCurrentDialogTokens());
        dispatch(DialogSlice.actions.clearPendingAttachments());
      },
      {
        fulfilled: (state, action) => {
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

    /**
     * @internal
     * 并行调用所有指定的 Cybot。
     * - 接收 cybot ID 列表和用户输入。
     * - 使用 Promise.all 并行调度 streamCybotId。
     * - 内部 catch 确保单个 cybot 失败不会中断其他 cybot。
     */
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

    /**
     * @internal
     * 根据对话模式编排 Cybot 响应。
     * - 接收对话配置和用户输入。
     * - 根据 PARALLEL, SEQUENTIAL 或 FIRST 模式调用 Cybot。
     */
    orchestrateCybotResponse: create.asyncThunk(
      async (
        args: { dialogConfig: DialogConfig; userInput: string },
        thunkApi
      ) => {
        const { dialogConfig, userInput } = args;
        const { dispatch } = thunkApi;
        const mode = dialogConfig?.mode;
        const cybots = dialogConfig?.cybots || [];

        try {
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
          } else {
            // 默认或 FIRST 模式
            if (cybots.length > 0) {
              const firstCybotId = cybots[0];
              await dispatch(
                streamCybotId({ cybotId: firstCybotId, userInput })
              ).unwrap();
            }
          }
        } catch (error) {
          console.error(
            `Error during cybot invocation in mode '${mode}':`,
            error
          );
          throw error;
        }
      }
    ),

    /**
     * 公开 Action: 处理用户发送消息的完整流程。
     * 这是 UI 组件应该 dispatch 的 action。
     * 它按顺序编排了消息持久化和 Cybot 响应两个步骤。
     */
    handleSendMessage: create.asyncThunk(
      async (args: { userInput: string }, thunkApi) => {
        const { userInput } = args;
        const { dispatch, getState, rejectWithValue } = thunkApi;
        const state = getState() as RootState;

        try {
          const dialogConfig = selectCurrentDialogConfig(state);
          if (!dialogConfig) {
            throw new Error(
              "handleSendMessage: Current dialog configuration is missing."
            );
          }

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
      async (_, thunkApi) => {
        const { dispatch, getState } = thunkApi;
        const state = getState() as RootState;
        const controllers = state.dialog.activeControllers;
        Object.values(controllers).forEach((controller) => {
          try {
            controller.abort();
          } catch (error) {
            console.error(`中止控制器失败:`, error);
          }
        });
        dispatch(DialogSlice.actions.clearActiveControllers());
        return { abortedCount: Object.keys(controllers).length };
      },
      {
        fulfilled: (state, action) => {
          console.log(`已中止 ${action.payload.abortedCount} 个请求`);
          state.activeControllers = {};
        },
        rejected: (state, action) => {
          console.error(`中止所有消息失败:`, action.error);
        },
      }
    ),
    clearActiveControllers: create.reducer((state) => {
      state.activeControllers = {};
    }),
  }),
});

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
    ? (selectById(state, state.dialog.currentDialogKey) as Dialog | null)
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
export const selectPendingFilesByType = (
  state: RootState,
  type: PendingFile["type"]
): PendingFile[] =>
  state.dialog.pendingFiles.filter((file) => file.type === type);
export const selectActiveControllers = (
  state: RootState
): Record<string, AbortController> => state.dialog.activeControllers;
