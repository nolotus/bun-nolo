import {
  type PayloadAction,
  asyncThunkCreator,
  buildCreateSlice,
} from "@reduxjs/toolkit";
import type { RootState } from "app/store";
import { deleteDialogMsgs } from "chat/messages/messageSlice";
import { read, selectById, patch } from "database/dbSlice";
import { extractCustomId } from "core/prefix";
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

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

interface TokenMetrics {
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  output_tokens: number;
  input_tokens: number;
}

// 定义附件类型 (仅保留 PendingFile)
export interface PendingFile {
  id: string;
  name: string;
  pageKey: string; // 只保存 pageKey
  type: "excel" | "docx" | "pdf" | "page"; // 新增 page 类型支持
}

// 定义 Slice 的 State 接口
interface DialogState {
  currentDialogKey: string | null;
  currentDialogTokens: {
    inputTokens: number;
    outputTokens: number;
  };
  isUpdatingMode: boolean;
  // 待处理的附件状态（仅保留 pendingFiles）
  pendingFiles: PendingFile[]; // 合并后的文件数组
  // 新增：存储正在进行的 AbortController 实例
  activeControllers: Record<string, AbortController>; // 以 messageId 为键
}

// 定义初始状态
const initialState: DialogState = {
  currentDialogKey: null,
  currentDialogTokens: {
    inputTokens: 0,
    outputTokens: 0,
  },
  isUpdatingMode: false,
  // 初始化附件状态（仅保留 pendingFiles）
  pendingFiles: [], // 初始化合并后的文件数组
  // 初始化控制器对象
  activeControllers: {},
};

const DialogSlice = createSliceWithThunks({
  name: "dialog",
  initialState,
  reducers: (create) => ({
    // --- 现有 Reducers ---
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
        // 在初始化新对话前清空待处理附件
        dispatch(DialogSlice.actions.clearPendingAttachments());
        const action = await dispatch(read(id));
        return { ...action.payload };
      },
      {
        pending: (state, action) => {
          state.currentDialogKey = action.meta.arg;
          // 清空 token 计数器
          state.currentDialogTokens = { inputTokens: 0, outputTokens: 0 };
          // 附件已在 thunk 中清除
        },
      }
    ),

    deleteDialog: create.asyncThunk(deleteDialogAction, {
      fulfilled: (state) => {
        // 如果删除的是当前对话，则状态在 deleteCurrentDialog 中处理
      },
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
        // 删除当前对话时，也清空附件
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
      // 清空对话状态时，也清空附件
      state.pendingFiles = []; // 清空合并后的文件数组
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

    // --- 附件管理 Reducers（仅保留与 pendingFiles 相关的） ---
    addPendingFile: create.reducer(
      (state, action: PayloadAction<PendingFile>) => {
        if (
          action.payload.id &&
          action.payload.name &&
          action.payload.pageKey
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
      state.pendingFiles = []; // 清空合并后的文件数组
    }),

    // 新增：添加控制器到状态
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

    // 新增：移除控制器（在请求完成后）
    removeActiveController: create.reducer(
      (state, action: PayloadAction<string>) => {
        delete state.activeControllers[action.payload];
      }
    ),

    // 新增：中止所有正在进行的请求
    abortAllMessages: create.asyncThunk(
      async (_, thunkApi) => {
        const { dispatch, getState } = thunkApi;
        const state = getState() as RootState;
        const controllers = state.dialog.activeControllers;

        // 对所有控制器调用 abort 方法
        Object.values(controllers).forEach((controller) => {
          try {
            controller.abort();
          } catch (error) {
            console.error(`中止控制器失败:`, error);
          }
        });

        // 清空控制器记录
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

    // 新增：清空所有控制器记录
    clearActiveControllers: create.reducer((state) => {
      state.activeControllers = {};
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
  addPendingFile,
  removePendingFile,
  clearPendingAttachments,
  addActiveController,
  removeActiveController,
  abortAllMessages,
  clearActiveControllers,
} = DialogSlice.actions;

export default DialogSlice.reducer;

// --- Selectors ---
export const selectCurrentDialogConfig = (state: RootState) =>
  state.dialog.currentDialogKey
    ? selectById(state, state.dialog.currentDialogKey)
    : null;

export const selectCurrentDialogKey = (state: RootState) =>
  state.dialog.currentDialogKey;

export const selectTotalDialogTokens = (state: RootState): number =>
  state.dialog.currentDialogTokens.inputTokens +
  state.dialog.currentDialogTokens.outputTokens;

export const selectIsUpdatingMode = (state: RootState): boolean =>
  state.dialog.isUpdatingMode;

// 新增 Selectors（仅保留与 pendingFiles 相关的）
export const selectPendingFiles = (state: RootState): PendingFile[] =>
  state.dialog.pendingFiles;

export const selectPendingFilesByType = (
  state: RootState,
  type: "excel" | "docx" | "pdf" | "page"
): PendingFile[] =>
  state.dialog.pendingFiles.filter((file) => file.type === type);

// 新增 Selector
export const selectActiveControllers = (
  state: RootState
): Record<string, AbortController> => state.dialog.activeControllers;
