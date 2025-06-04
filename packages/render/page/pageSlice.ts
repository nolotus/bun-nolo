// 文件路径：render/page/pageSlice.ts

import { formatISO } from "date-fns";
import {
  asyncThunkCreator,
  buildCreateSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { read, patch } from "database/dbSlice";
import { updateContentTitle } from "create/space/spaceSlice";
import { extractTitleFromSlate } from "create/editor/utils/slateUtils";
import { DataType } from "create/types";
import { createPageAction } from "./createPageAction";
import { PageData } from "./types";

// —— State 接口 ——
export interface PageSliceState {
  content: string | null;
  slateData: any | null;
  title: string | null;
  dbSpaceId: string | null;
  tags: string[] | null;
  isReadOnly: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  currentPageId: string | null;

  // 新增保存状态字段
  isSaving: boolean;
  saveError: string | null;
  lastSavedAt: string | null; // ISO 字符串
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
          const readAction = await dispatch(read(pageId));
          if (read.fulfilled.match(readAction) && readAction.payload) {
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
          state.isLoading = true;
          state.isInitialized = false;
          state.error = null;
          state.currentPageId = action.meta.arg.pageId;

          state.content = null;
          state.slateData = null;
          state.title = null;
          state.dbSpaceId = null;
          state.tags = null;
          state.isReadOnly = action.meta.arg.isReadOnly;
        },
        fulfilled: (state, action: PayloadAction<InitPagePayload>) => {
          state.isLoading = false;
          state.isInitialized = true;
          state.error = null;

          state.content = action.payload.content;
          state.slateData = action.payload.slateData;
          state.title = action.payload.title;
          state.dbSpaceId = action.payload.spaceId;
          state.tags = action.payload.tags || null;
          state.isReadOnly = action.payload.isReadOnly;
          state.currentPageId = action.payload.dbKey;
        },
        rejected: (state, action) => {
          state.isLoading = false;
          state.isInitialized = false;
          state.error =
            (action.payload as string) ||
            action.error.message ||
            "初始化页面时发生未知错误";

          state.content = null;
          state.slateData = null;
          state.title = null;
          state.dbSpaceId = null;
          state.tags = null;
          state.isReadOnly = true;
          state.currentPageId = null;
        },
      }
    ),

    // 更新 Slate 数据
    updateSlate: create.reducer((state, action: PayloadAction<any>) => {
      if (state.isInitialized) {
        state.slateData = action.payload;
      }
    }),

    // 只读模式切换 / 设置
    toggleReadOnly: create.reducer((state) => {
      state.isReadOnly = !state.isReadOnly;
    }),
    setReadOnly: create.reducer((state, action: PayloadAction<boolean>) => {
      state.isReadOnly = action.payload;
    }),

    // 重置整个页面 slice
    resetPage: create.reducer((state) => {
      Object.assign(state, initialState);
    }),

    // 同步更新 UI 上的标题 / 标签（不持久化）
    updatePageTitle: create.reducer((state, action: PayloadAction<string>) => {
      if (state.isInitialized) state.title = action.payload;
    }),
    updatePageTags: create.reducer((state, action: PayloadAction<string[]>) => {
      if (state.isInitialized) state.tags = action.payload;
    }),

    // —— 统一保存 Thunk ——
    savePage: create.asyncThunk(
      // 参数不用，从 getState() 里取
      async (_arg: void, { dispatch, getState, rejectWithValue }) => {
        const root = (getState() as any).page as PageSliceState & {
          currentPageId: string | null;
          slateData: any;
          dbSpaceId: string | null;
        };
        const dbKey = root.currentPageId;
        if (!dbKey) return rejectWithValue("缺少 pageKey，无法保存");

        const slateData = root.slateData;
        // 从 slateData 提取一级标题
        const title = extractTitleFromSlate(slateData) || "未命名页面";
        const spaceId = root.dbSpaceId;
        const now = new Date();
        const iso = formatISO(now);

        try {
          // 1) 保存到后端
          await dispatch(
            patch({
              dbKey,
              changes: { updatedAt: iso, slateData, title },
            })
          ).unwrap();

          // 2) 同步 Space 侧边栏标题
          if (spaceId) {
            await dispatch(
              updateContentTitle({
                spaceId,
                contentKey: dbKey,
                title,
              })
            ).unwrap();
          }

          // 3) 本地更新 title（UI 立刻生效）
          dispatch(pageSlice.actions.updatePageTitle(title));

          return { updatedAt: iso };
        } catch (e: any) {
          return rejectWithValue(e.message || "保存失败");
        }
      },
      {
        pending: (state) => {
          state.isSaving = true;
          state.saveError = null;
        },
        fulfilled: (state, action: PayloadAction<{ updatedAt: string }>) => {
          state.isSaving = false;
          state.lastSavedAt = action.payload.updatedAt;
        },
        rejected: (state, action) => {
          state.isSaving = false;
          state.saveError =
            (action.payload as string) || action.error.message || "未知错误";
        },
      }
    ),
  }),

  // —— Selectors ——
  selectors: {
    selectSlateData: (s: PageSliceState) => s.slateData,
    selectPageData: (s: PageSliceState) => s,
    selectIsReadOnly: (s: PageSliceState) => s.isReadOnly,
    selectPageIsLoading: (s: PageSliceState) => s.isLoading,
    selectPageIsInitialized: (s: PageSliceState) => s.isInitialized,
    selectPageError: (s: PageSliceState) => s.error,
    selectCurrentPageTitle: (s: PageSliceState) => s.title,
    selectPageDbSpaceId: (s: PageSliceState) => s.dbSpaceId,
    selectCurrentPageId: (s: PageSliceState) => s.currentPageId,
    selectPageTags: (s: PageSliceState) => s.tags,

    // 保存状态相关
    selectIsSaving: (s: PageSliceState) => s.isSaving,
    selectSaveError: (s: PageSliceState) => s.saveError,
    selectLastSavedAt: (s: PageSliceState) => s.lastSavedAt,
  },
});

// —— 导出 Actions 和 Reducer ——
export const {
  createPage,
  initPage,
  updateSlate,
  toggleReadOnly,
  setReadOnly,
  resetPage,
  updatePageTitle,
  updatePageTags,
  savePage,
} = pageSlice.actions;

export const {
  selectSlateData,
  selectPageData,
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
} = pageSlice.selectors;

export default pageSlice.reducer;
