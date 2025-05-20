// dialogSlice.ts
import {
  type PayloadAction,
  asyncThunkCreator,
  buildCreateSlice,
  createAction,
  nanoid,
} from "@reduxjs/toolkit";
import type { NoloRootState } from "app/store";
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

// 定义附件类型 (从 MessageInput 移动并调整)
export interface PendingImagePreview {
  id: string;
  url: string; // Base64 or Blob URL
}

export interface PendingExcelFile {
  id: string;
  name: string;
  pageKey: string; // 只保存 pageKey
}

// 新增 DOCX 文件类型
export interface PendingDocxFile {
  id: string;
  name: string;
  pageKey: string; // 只保存 pageKey
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
  pendingDocxFiles: PendingDocxFile[]; // 新增 DOCX 文件状态
  previewingFile: { id: string; type: "excel" | "docx" } | null; // 统一预览状态
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
  pendingDocxFiles: [], // 初始化 DOCX 文件状态
  previewingFile: null, // 初始化统一预览状态
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
        const state = thunkApi.getState() as NoloRootState;
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
      state.pendingImagePreviews = [];
      state.pendingExcelFiles = [];
      state.pendingDocxFiles = []; // 清空 DOCX 文件
      state.previewingFile = null; // 清空统一预览状态
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
        const newImage: PendingImagePreview = {
          id: nanoid(),
          url: action.payload,
        };
        state.pendingImagePreviews.push(newImage);
      }
    ),
    addPendingExcelFile: create.reducer(
      (state, action: PayloadAction<PendingExcelFile>) => {
        if (
          action.payload.id &&
          action.payload.name &&
          action.payload.pageKey
        ) {
          state.pendingExcelFiles.push(action.payload);
        }
      }
    ),
    // 新增 DOCX 文件相关 reducers
    addPendingDocxFile: create.reducer(
      (state, action: PayloadAction<PendingDocxFile>) => {
        if (
          action.payload.id &&
          action.payload.name &&
          action.payload.pageKey
        ) {
          state.pendingDocxFiles.push(action.payload);
        }
      }
    ),
    removePendingImagePreview: create.reducer(
      (state, action: PayloadAction<string>) => {
        state.pendingImagePreviews = state.pendingImagePreviews.filter(
          (img) => img.id !== action.payload
        );
      }
    ),
    removePendingExcelFile: create.reducer(
      (state, action: PayloadAction<string>) => {
        state.pendingExcelFiles = state.pendingExcelFiles.filter(
          (file) => file.id !== action.payload
        );
        if (state.previewingFile?.id === action.payload) {
          state.previewingFile = null;
        }
      }
    ),
    // 新增移除 DOCX 文件的 reducer
    removePendingDocxFile: create.reducer(
      (state, action: PayloadAction<string>) => {
        state.pendingDocxFiles = state.pendingDocxFiles.filter(
          (file) => file.id !== action.payload
        );
        if (state.previewingFile?.id === action.payload) {
          state.previewingFile = null;
        }
      }
    ),
    setPreviewingFile: create.reducer(
      (
        state,
        action: PayloadAction<{ id: string; type: "excel" | "docx" } | null>
      ) => {
        state.previewingFile = action.payload;
      }
    ),
    clearPendingAttachments: create.reducer((state) => {
      state.pendingImagePreviews = [];
      state.pendingExcelFiles = [];
      state.pendingDocxFiles = []; // 清空 DOCX 文件
      state.previewingFile = null; // 清空统一预览状态
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
  addPendingImagePreview,
  addPendingExcelFile,
  removePendingImagePreview,
  removePendingExcelFile,
  clearPendingAttachments,
  // 新增 DOCX 文件相关 actions
  addPendingDocxFile,
  removePendingDocxFile,
  setPreviewingFile,
} = DialogSlice.actions;

export default DialogSlice.reducer;

// --- Selectors ---
export const selectCurrentDialogConfig = (state: NoloRootState) =>
  state.dialog.currentDialogKey
    ? selectById(state, state.dialog.currentDialogKey)
    : null;

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

// 新增 DOCX 文件 selector
export const selectPendingDocxFiles = (
  state: NoloRootState
): PendingDocxFile[] => state.dialog.pendingDocxFiles;

export const selectPreviewingFile = (
  state: NoloRootState
): { id: string; type: "excel" | "docx" } | null => state.dialog.previewingFile;

// 派生 Selector，用于获取正在预览的文件对象
export const selectPreviewingFileObject = (
  state: NoloRootState
): PendingExcelFile | PendingDocxFile | null => {
  const previewingFile = state.dialog.previewingFile;
  if (!previewingFile) return null;
  if (previewingFile.type === "excel") {
    const files = selectPendingExcelFiles(state);
    return files.find((file) => file.id === previewingFile.id) || null;
  } else {
    const files = selectPendingDocxFiles(state);
    return files.find((file) => file.id === previewingFile.id) || null;
  }
};
