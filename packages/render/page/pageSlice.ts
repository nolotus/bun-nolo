// 文件: store/features/page/pageSlice.ts
// (假设文件路径)

import { formatISO } from "date-fns";
import {
  asyncThunkCreator,
  buildCreateSlice,
  createListenerMiddleware,
  PayloadAction,
  isAnyOf,
} from "@reduxjs/toolkit";
import { RootState } from "app/store"; // 假设的 RootState 类型路径
import { readAndWait, patch } from "database/dbSlice";
import { updateContentTitle } from "create/space/spaceSlice";
import {
  extractTitleFromSlate,
  compareSlateContent,
  EditorContent,
} from "create/editor/utils/slateUtils";
import { DataType } from "create/types";
import { createPageAction } from "./createPageAction";
import { PageData } from "./types";

const AUTO_SAVE_DELAY_MS = 2000; // 自动保存延时

// —— State 接口 ——
export interface PageSliceState {
  content: string | null;
  slateData: EditorContent | null;
  title: string | null;
  dbSpaceId: string | null;
  tags: string[] | null;
  isReadOnly: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  currentPageId: string | null;
  isSaving: boolean;
  saveError: string | null;
  lastSavedAt: string | null;
  lastSavedSlateData: EditorContent | null;
  justSaved: boolean;
}

// —— 初始状态 ——
const initialState: PageSliceState = {
  content: null,
  slateData: null,
  title: null,
  dbSpaceId: null,
  tags: null,
  isReadOnly: true,
  isLoading: false,
  isInitialized: false,
  error: null,
  currentPageId: null,
  isSaving: false,
  saveError: null,
  lastSavedAt: null,
  lastSavedSlateData: null,
  justSaved: false,
};

// —— initPage 参数和 payload 类型 ——
interface InitPageArgs {
  pageId: string;
  isReadOnly: boolean;
}

interface InitPagePayload extends PageData {
  isReadOnly: boolean;
}

// —— 构造带 asyncThunk 的 Slice ——
const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

export const pageSlice = createSliceWithThunks({
  name: "page",
  initialState,
  reducers: (create) => ({
    createPage: create.asyncThunk(createPageAction),

    initPage: create.asyncThunk(
      async (args: InitPageArgs, { dispatch, rejectWithValue }) => {
        const { pageId, isReadOnly } = args;
        try {
          const readAction = await dispatch(readAndWait(pageId));

          if (readAndWait.fulfilled.match(readAction) && readAction.payload) {
            const data = readAction.payload as PageData;
            if (data.type !== DataType.PAGE) {
              return rejectWithValue(`加载的内容 ${pageId} 不是页面类型`);
            }
            return { ...data, isReadOnly };
          } else {
            const msg =
              (readAction.payload as any)?.message || `无法加载页面 ${pageId}`;
            return rejectWithValue(msg);
          }
        } catch (e: any) {
          return rejectWithValue(e.message || `初始化页面 ${pageId} 时出错`);
        }
      },
      {
        pending: (
          state,
          action: PayloadAction<undefined, string, { arg: InitPageArgs }>
        ) => {
          Object.assign(state, initialState);
          state.isLoading = true;
          state.currentPageId = action.meta.arg.pageId;
          state.isReadOnly = action.meta.arg.isReadOnly;
        },
        fulfilled: (state, action: PayloadAction<InitPagePayload>) => {
          state.isLoading = false;
          state.isInitialized = true;
          state.error = null;
          state.content = action.payload.content;
          state.slateData = action.payload.slateData;
          state.lastSavedSlateData = action.payload.slateData;
          state.title = action.payload.title;
          state.dbSpaceId = action.payload.spaceId;
          state.tags = action.payload.tags || null;
          state.isReadOnly = action.payload.isReadOnly;
          state.currentPageId = action.payload.dbKey;
          state.lastSavedAt = action.payload.updatedAt || null;
        },
        rejected: (state, action) => {
          state.isLoading = false;
          state.isInitialized = true;
          state.error =
            (action.payload as string) ||
            action.error.message ||
            "初始化页面时发生未知错误";
        },
      }
    ),

    updateSlate: create.reducer(
      (state, action: PayloadAction<EditorContent>) => {
        if (state.isInitialized && !state.isReadOnly) {
          state.slateData = action.payload;
          state.justSaved = false;
        }
      }
    ),

    savePage: create.asyncThunk(
      async (_arg: void, { dispatch, getState, rejectWithValue }) => {
        const state = (getState() as RootState).page;
        const { currentPageId, slateData, dbSpaceId } = state;

        if (!currentPageId) return rejectWithValue("缺少 pageId，无法保存");
        if (!slateData) return rejectWithValue("内容为空，无法保存");
        // 注意：这里的 condition 检查已经很完善，能防止无效的保存请求

        const title = extractTitleFromSlate(slateData) || "未命名页面";
        const now = new Date();

        try {
          // 这个 thunk 的核心逻辑是异步的，但 dispatch(savePage()) 本身可以被同步或异步等待
          await dispatch(
            patch({
              dbKey: currentPageId,
              changes: { updatedAt: formatISO(now), slateData, title },
            })
          ).unwrap();

          if (dbSpaceId) {
            await dispatch(
              updateContentTitle({
                spaceId: dbSpaceId,
                contentKey: currentPageId,
                title,
              })
            ).unwrap();
          }

          return { updatedAt: formatISO(now), title, savedContent: slateData };
        } catch (e: any) {
          return rejectWithValue(e.message || "保存失败");
        }
      },
      {
        condition: (_arg, { getState }) => {
          const state = (getState() as RootState).page;
          if (state.isSaving) return false;
          const hasChanges = compareSlateContent(
            state.slateData,
            state.lastSavedSlateData
          );
          if (!hasChanges) return false;
          return true;
        },
        pending: (state) => {
          state.isSaving = true;
          state.saveError = null;
          state.justSaved = false;
        },
        fulfilled: (
          state,
          action: PayloadAction<{
            updatedAt: string;
            title: string;
            savedContent: EditorContent;
          }>
        ) => {
          state.isSaving = false;
          state.lastSavedAt = action.payload.updatedAt;
          state.title = action.payload.title;
          state.lastSavedSlateData = action.payload.savedContent;
          state.justSaved = true;
        },
        rejected: (state, action) => {
          state.isSaving = false;
          state.saveError =
            (action.payload as string) || action.error.message || "未知错误";
          state.justSaved = false;
        },
      }
    ),

    resetJustSavedStatus: create.reducer((state) => {
      state.justSaved = false;
    }),

    toggleReadOnly: create.reducer((state) => {
      state.isReadOnly = !state.isReadOnly;
    }),
    setReadOnly: create.reducer((state, action: PayloadAction<boolean>) => {
      state.isReadOnly = action.payload;
    }),
    resetPage: create.reducer((state) => {
      Object.assign(state, initialState);
    }),
    updatePageTags: create.reducer((state, action: PayloadAction<string[]>) => {
      if (state.isInitialized) state.tags = action.payload;
    }),
  }),

  selectors: {
    selectPageData: (s: PageSliceState) => s,
    selectSlateData: (s: PageSliceState) => s.slateData,
    selectIsReadOnly: (s: PageSliceState) => s.isReadOnly,
    selectPageIsLoading: (s: PageSliceState) => s.isLoading,
    selectPageIsInitialized: (s: PageSliceState) => s.isInitialized,
    selectPageError: (s: PageSliceState) => s.error,
    selectIsSaving: (s: PageSliceState) => s.isSaving,
    selectSaveError: (s: PageSliceState) => s.saveError,
    selectJustSaved: (s: PageSliceState) => s.justSaved,
    selectHasPendingChanges: (s: PageSliceState) => {
      if (!s.isInitialized || s.isReadOnly) return false;
      return compareSlateContent(s.slateData, s.lastSavedSlateData);
    },
    selectCurrentPageTitle: (s: PageSliceState) => s.title,
    selectPageDbSpaceId: (s: PageSliceState) => s.dbSpaceId,
    selectCurrentPageId: (s: PageSliceState) => s.currentPageId,
    selectPageTags: (s: PageSliceState) => s.tags,
    selectLastSavedAt: (s: PageSliceState) => s.lastSavedAt,
  },
});

export const {
  createPage,
  initPage,
  updateSlate,
  savePage,
  resetJustSavedStatus,
  toggleReadOnly,
  setReadOnly,
  resetPage,
  updatePageTags,
} = pageSlice.actions;

export const {
  selectPageData,
  selectSlateData,
  selectIsReadOnly,
  selectPageIsLoading,
  selectPageIsInitialized,
  selectPageError,
  selectIsSaving,
  selectSaveError,
  selectJustSaved,
  selectHasPendingChanges,
  selectCurrentPageTitle,
  selectPageDbSpaceId,
  selectCurrentPageId,
  selectPageTags,
  selectLastSavedAt,
} = pageSlice.selectors;

export default pageSlice.reducer;

export const pageListenerMiddleware = createListenerMiddleware();

pageListenerMiddleware.startListening({
  actionCreator: updateSlate,
  effect: async (action, listenerApi) => {
    listenerApi.cancelActiveListeners();
    await listenerApi.delay(AUTO_SAVE_DELAY_MS);
    listenerApi.dispatch(savePage());
  },
});
