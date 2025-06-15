import { formatISO } from "date-fns";
import {
  asyncThunkCreator,
  buildCreateSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
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

  // 保存状态字段
  isSaving: boolean;
  saveError: string | null;
  lastSavedAt: string | null; // ISO 字符串
  lastSavedSlateData: EditorContent | null; // 上次成功保存时的内容
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
    // 创建页面（暂时不管）
    createPage: create.asyncThunk(createPageAction),

    // 初始化页面：读数据库
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
          // 使用 initialState 重置，避免状态污染
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
          state.lastSavedSlateData = action.payload.slateData; // 关键：初始化保存基准
          state.title = action.payload.title;
          state.dbSpaceId = action.payload.spaceId;
          state.tags = action.payload.tags || null;
          state.isReadOnly = action.payload.isReadOnly;
          state.currentPageId = action.payload.dbKey;
          state.lastSavedAt = action.payload.updatedAt || null;
        },
        rejected: (state, action) => {
          state.isLoading = false;
          state.isInitialized = true; // 即使失败也标记为已初始化，以显示错误信息
          state.error =
            (action.payload as string) ||
            action.error.message ||
            "初始化页面时发生未知错误";
        },
      }
    ),

    // 更新 Slate 数据
    updateSlate: create.reducer(
      (state, action: PayloadAction<EditorContent>) => {
        if (state.isInitialized && !state.isReadOnly) {
          state.slateData = action.payload;
        }
      }
    ),

    // 统一保存 Thunk
    savePage: create.asyncThunk(
      async (_arg: void, { dispatch, getState, rejectWithValue }) => {
        const state = (getState() as any).page as PageSliceState;
        const { currentPageId, slateData, dbSpaceId } = state;

        if (!currentPageId) return rejectWithValue("缺少 pageId，无法保存");
        if (!slateData) return rejectWithValue("内容为空，无法保存");

        const title = extractTitleFromSlate(slateData) || "未命名页面";
        const now = new Date();

        try {
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
        // 关键：在 Thunk 执行前进行条件检查
        condition: (_arg, { getState }) => {
          const state = (getState() as any).page as PageSliceState;

          // 如果正在保存中，则取消本次操作，防止并发
          if (state.isSaving) {
            return false;
          }

          // 如果内容没有变化，则取消本次操作，防止不必要的请求
          const hasChanges = compareSlateContent(
            state.slateData,
            state.lastSavedSlateData
          );
          if (!hasChanges) {
            return false;
          }

          return true;
        },
        pending: (state) => {
          state.isSaving = true;
          state.saveError = null;
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
          // 关键：保存成功后，更新“上次保存的内容”基准
          state.lastSavedSlateData = action.payload.savedContent;
        },
        rejected: (state, action) => {
          state.isSaving = false;
          state.saveError =
            (action.payload as string) || action.error.message || "未知错误";
        },
      }
    ),

    // 其他 reducers
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

  // —— Selectors ——
  selectors: {
    selectPageData: (s: PageSliceState) => s,
    selectSlateData: (s: PageSliceState) => s.slateData,
    selectIsReadOnly: (s: PageSliceState) => s.isReadOnly,
    selectPageIsLoading: (s: PageSliceState) => s.isLoading,
    selectPageIsInitialized: (s: PageSliceState) => s.isInitialized,
    selectPageError: (s: PageSliceState) => s.error,
    selectCurrentPageTitle: (s: PageSliceState) => s.title,
    selectPageDbSpaceId: (s: PageSliceState) => s.dbSpaceId,
    selectCurrentPageId: (s: PageSliceState) => s.currentPageId,
    selectPageTags: (s: PageSliceState) => s.tags,
    selectIsSaving: (s: PageSliceState) => s.isSaving,
    selectSaveError: (s: PageSliceState) => s.saveError,
    selectLastSavedAt: (s: PageSliceState) => s.lastSavedAt,
    // 新增：直接从 Redux 判断是否有未保存的更改
    selectHasPendingChanges: (s: PageSliceState) => {
      if (!s.isInitialized) return false;
      return compareSlateContent(s.slateData, s.lastSavedSlateData);
    },
  },
});

// —— 导出 Actions 和 Reducer ——
export const {
  createPage,
  initPage,
  updateSlate,
  savePage,
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
  selectCurrentPageTitle,
  selectPageDbSpaceId,
  selectCurrentPageId,
  selectPageTags,
  selectIsSaving,
  selectSaveError,
  selectLastSavedAt,
  selectHasPendingChanges,
} = pageSlice.selectors;

export default pageSlice.reducer;
