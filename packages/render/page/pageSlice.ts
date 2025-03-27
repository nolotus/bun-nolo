import {
  asyncThunkCreator,
  buildCreateSlice,
  PayloadAction, // 确保导入 PayloadAction
} from "@reduxjs/toolkit";
import { selectCurrentUserId } from "auth/authSlice";
import { ParagraphType } from "create/editor/type";
import {
  addContentToSpace,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";
import { DataType } from "create/types";
import { write, read } from "database/dbSlice";
import { createPageKey } from "database/keys";
import { t } from "i18next";
import type { NoloRootState } from "app/store";

// 页面数据接口 (来自数据库)
interface PageData {
  id: string;
  dbKey: string; // pageKey
  type: DataType.PAGE;
  title: string;
  content?: string | null;
  slateData?: any | null;
  spaceId: string | null; // 页面所属的 spaceId
  created: string;
  updated_at?: string;
}

// pageSlice 的 State 接口
interface PageSliceState {
  content: string | null;
  slateData: any | null;
  title: string | null; // 这个 title 将被 updatePageTitle 更新
  dbSpaceId: string | null;
  isReadOnly: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  currentPageId: string | null; // 存储 pageKey/dbKey
}

// initPage Thunk 的输入参数类型
interface InitPageArgs {
  pageId: string; // 对应 pageKey
  isReadOnly: boolean;
}

// initPage Thunk fulfilled action 的 payload 类型
interface InitPagePayload extends PageData {
  isReadOnly: boolean;
}

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

// --- pageSlice 定义 ---
export const pageSlice = createSliceWithThunks({
  name: "page",
  initialState: {
    content: null,
    slateData: null,
    title: null,
    dbSpaceId: null,
    isReadOnly: true,
    isLoading: false,
    isInitialized: false,
    error: null,
    currentPageId: null,
  } as PageSliceState,

  reducers: (create) => ({
    // --- createPage Async Thunk ---
    createPage: create.asyncThunk(
      async (
        args: { categoryId?: string; spaceId?: string } = {},
        { dispatch, getState }
      ) => {
        const { categoryId, spaceId: customSpaceId } = args;
        const state = getState() as NoloRootState;
        const userId = selectCurrentUserId(state);
        const effectiveSpaceId = customSpaceId || selectCurrentSpaceId(state);
        if (!userId) throw new Error("User ID not found.");
        const { dbKey, id } = createPageKey.create(userId);
        const title = t("newPageTitle", { defaultValue: "新页面" });
        const pageData: PageData = {
          dbKey,
          id,
          type: DataType.PAGE,
          title,
          spaceId: effectiveSpaceId,
          slateData: [
            {
              type: ParagraphType,
              children: [
                { text: t("introtext", { defaultValue: "开始写作..." }) },
              ],
            },
          ],
          created: new Date().toISOString(),
        };
        await dispatch(write({ data: pageData, customKey: dbKey })).unwrap();
        if (effectiveSpaceId) {
          dispatch(
            addContentToSpace({
              contentKey: dbKey,
              type: DataType.PAGE,
              spaceId: effectiveSpaceId,
              title,
              categoryId,
            })
          );
        }
        return dbKey;
      }
    ),

    // --- initPage Async Thunk ---
    initPage: create.asyncThunk(
      async (args: InitPageArgs, { dispatch, rejectWithValue }) => {
        const { pageId, isReadOnly } = args;
        try {
          const readAction = await dispatch(read(pageId));
          if (read.fulfilled.match(readAction) && readAction.payload) {
            const fetchedData = readAction.payload as PageData;
            if (fetchedData.type !== DataType.PAGE) {
              return rejectWithValue(
                `加载的内容 ${pageId} 不是一个有效的页面。`
              );
            }
            const resultPayload: InitPagePayload = {
              ...fetchedData,
              isReadOnly,
            };
            return resultPayload;
          } else {
            const errorMessage =
              (readAction.payload as any)?.message ||
              `无法加载页面 ${pageId} 的数据`;
            return rejectWithValue(errorMessage);
          }
        } catch (error: any) {
          return rejectWithValue(
            error.message || `初始化页面 ${pageId} 时发生意外错误`
          );
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
          state.isReadOnly = true;
        },
        fulfilled: (state, action: PayloadAction<InitPagePayload>) => {
          state.isLoading = false;
          state.isInitialized = true;
          state.error = null;
          state.content = action.payload.content;
          state.slateData = action.payload.slateData;
          state.title = action.payload.title; // 设置初始标题
          state.dbSpaceId = action.payload.spaceId;
          state.isReadOnly = action.payload.isReadOnly;
          state.currentPageId = action.payload.dbKey;
        },
        rejected: (state, action) => {
          state.isLoading = false;
          state.isInitialized = false;
          state.error =
            (action.payload as string) ||
            action.error?.message ||
            "初始化页面时发生未知错误";
        },
      }
    ),

    // --- Standard Reducers ---
    updateSlate: create.reducer((state, action: PayloadAction<any>) => {
      if (state.isInitialized) state.slateData = action.payload;
    }),
    toggleReadOnly: create.reducer((state) => {
      state.isReadOnly = !state.isReadOnly;
    }),
    setReadOnly: create.reducer((state, action: PayloadAction<boolean>) => {
      state.isReadOnly = action.payload;
    }),
    resetPage: create.reducer((state) => {
      state.content = null;
      state.slateData = null;
      state.title = null;
      state.dbSpaceId = null;
      state.isReadOnly = true;
      state.isLoading = false;
      state.isInitialized = false;
      state.error = null;
      state.currentPageId = null;
    }),

    // **** 新增 Reducer 用于更新标题 ****
    updatePageTitle: create.reducer((state, action: PayloadAction<string>) => {
      // 可以在这里添加检查 state.isInitialized 如果需要
      state.title = action.payload;
    }),
  }),

  // --- Selectors ---
  selectors: {
    selectSlateData: (state: PageSliceState) => state.slateData,
    selectPageData: (state: PageSliceState) => state,
    selectIsReadOnly: (state: PageSliceState) => state.isReadOnly,
    selectPageIsLoading: (state: PageSliceState) => state.isLoading,
    selectPageIsInitialized: (state: PageSliceState) => state.isInitialized,
    selectPageError: (state: PageSliceState) => state.error,
    selectCurrentPageTitle: (state: PageSliceState) => state.title,
    selectPageDbSpaceId: (state: PageSliceState) => state.dbSpaceId,
    selectCurrentPageId: (state: PageSliceState) => state.currentPageId,
  },
});

// 导出 Actions (包含新的 action)
export const {
  createPage,
  initPage,
  updateSlate,
  resetPage,
  toggleReadOnly,
  setReadOnly,
  updatePageTitle, // **** 导出 updatePageTitle ****
} = pageSlice.actions;

// 导出 Selectors
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
} = pageSlice.selectors;

// 导出 Reducer
export default pageSlice.reducer;
