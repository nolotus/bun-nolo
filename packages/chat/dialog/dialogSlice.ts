// dialogSlice.ts
import {
  type PayloadAction,
  asyncThunkCreator,
  buildCreateSlice,
  createAction, // 导入 createAction 用于非异步 reducer
  nanoid, // 导入 nanoid 生成唯一 ID
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

// 定义附件类型 (从 MessageInput 移动并调整)
export interface PendingImagePreview {
  id: string;
  url: string; // Base64 or Blob URL
}

export interface PendingExcelFile {
  id: string;
  name: string;
  data: any[]; // 保持 any[] 或定义更具体的类型
}

// 定义 Slice 的 State 接口
interface DialogState {
  currentDialogKey: string | null;
  currentDialogTokens: {
    inputTokens: number;
    outputTokens: number;
  };
  isUpdatingMode: boolean;
  // 新增：待处理的附件状态
  pendingImagePreviews: PendingImagePreview[];
  pendingExcelFiles: PendingExcelFile[];
  previewingExcelFileId: string | null;
}

// 定义初始状态
const initialState: DialogState = {
  currentDialogKey: null,
  currentDialogTokens: {
    inputTokens: 0,
    outputTokens: 0,
  },
  isUpdatingMode: false,
  // 新增：初始化附件状态
  pendingImagePreviews: [],
  pendingExcelFiles: [],
  previewingExcelFileId: null,
};

const DialogSlice = createSliceWithThunks({
  name: "dialog", // 通常 slice name 应该是 'dialog' 而不是 'chat'，除非它管理整个聊天
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
        const state = thunkApi.getState() as NoloRootState; // 强制类型转换
        dispatch(deleteDialog(dialogKey)); //
        const spaceId = selectCurrentSpaceId(state);
        if (spaceId) {
          // 添加检查，确保 spaceId 存在
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
          state.currentDialogKey = null; // 确保当前对话 key 被清除
        },
      }
    ),

    clearDialogState: create.reducer((state) => {
      state.currentDialogKey = null;
      state.currentDialogTokens = { inputTokens: 0, outputTokens: 0 };
      // 清空对话状态时，也清空附件
      state.pendingImagePreviews = [];
      state.pendingExcelFiles = [];
      state.previewingExcelFileId = null;
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

    // --- 新增：附件管理 Reducers ---
    addPendingImagePreview: create.reducer(
      (state, action: PayloadAction<string>) => {
        // 使用 nanoid 生成唯一 ID
        const newImage: PendingImagePreview = {
          id: nanoid(),
          url: action.payload,
        };
        state.pendingImagePreviews.push(newImage);
      }
    ),
    addPendingExcelFile: create.reducer(
      (state, action: PayloadAction<PendingExcelFile>) => {
        // 确保传入的对象包含 id, name, data
        if (action.payload.id && action.payload.name && action.payload.data) {
          state.pendingExcelFiles.push(action.payload);
        }
      }
    ),
    removePendingImagePreview: create.reducer(
      (state, action: PayloadAction<string>) => {
        // 按 ID 移除
        state.pendingImagePreviews = state.pendingImagePreviews.filter(
          (img) => img.id !== action.payload
        );
      }
    ),
    removePendingExcelFile: create.reducer(
      (state, action: PayloadAction<string>) => {
        // 按 ID 移除
        state.pendingExcelFiles = state.pendingExcelFiles.filter(
          (file) => file.id !== action.payload
        );
        // 如果移除的是正在预览的文件，则关闭预览
        if (state.previewingExcelFileId === action.payload) {
          state.previewingExcelFileId = null;
        }
      }
    ),
    setPreviewingExcelFile: create.reducer(
      (state, action: PayloadAction<string | null>) => {
        state.previewingExcelFileId = action.payload;
      }
    ),
    clearPendingAttachments: create.reducer((state) => {
      state.pendingImagePreviews = [];
      state.pendingExcelFiles = [];
      state.previewingExcelFileId = null;
    }),
  }),
});

export const {
  // 现有 actions
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
  // 新增 actions
  addPendingImagePreview,
  addPendingExcelFile,
  removePendingImagePreview,
  removePendingExcelFile,
  setPreviewingExcelFile,
  clearPendingAttachments,
} = DialogSlice.actions;

export default DialogSlice.reducer;

// --- Selectors ---
export const selectCurrentDialogConfig = (state: NoloRootState) =>
  state.dialog.currentDialogKey
    ? selectById(state, state.dialog.currentDialogKey)
    : null; // 添加 null 检查

export const selectCurrentDialogKey = (state: NoloRootState) =>
  state.dialog.currentDialogKey;

export const selectTotalDialogTokens = (state: NoloRootState): number =>
  state.dialog.currentDialogTokens.inputTokens +
  state.dialog.currentDialogTokens.outputTokens;

export const selectIsUpdatingMode = (state: NoloRootState): boolean =>
  state.dialog.isUpdatingMode;

// 新增 Selectors
export const selectPendingImagePreviews = (
  state: NoloRootState
): PendingImagePreview[] => state.dialog.pendingImagePreviews;

export const selectPendingExcelFiles = (
  state: NoloRootState
): PendingExcelFile[] => state.dialog.pendingExcelFiles;

export const selectPreviewingExcelFileId = (
  state: NoloRootState
): string | null => state.dialog.previewingExcelFileId;

// 派生 Selector，用于获取正在预览的 Excel 文件对象
export const selectPreviewingExcelFile = (
  state: NoloRootState
): PendingExcelFile | null => {
  const id = selectPreviewingExcelFileId(state);
  if (!id) return null;
  const files = selectPendingExcelFiles(state);
  return files.find((file) => file.id === id) || null;
};
