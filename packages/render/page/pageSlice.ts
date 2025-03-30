import {
  asyncThunkCreator,
  buildCreateSlice,
  PayloadAction,
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

// 页面数据接口 (来自数据库) - 添加 tags
interface PageData {
  id: string;
  dbKey: string; // pageKey
  type: DataType.PAGE;
  title: string;
  content?: string | null;
  slateData?: any | null;
  spaceId: string | null; // 页面所属的 spaceId
  tags?: string[]; // **** 添加 tags 字段 ****
  created: string;
  updated_at?: string;
}

// pageSlice 的 State 接口 - 添加 tags
interface PageSliceState {
  content: string | null;
  slateData: any | null;
  title: string | null;
  dbSpaceId: string | null;
  tags: string[] | null; // **** 添加 tags 字段 ****
  isReadOnly: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  currentPageId: string | null;
}

// initPage Thunk 的输入参数类型
interface InitPageArgs {
  pageId: string; // 对应 pageKey
  isReadOnly: boolean;
}

// initPage Thunk fulfilled action 的 payload 类型 - 添加 tags
interface InitPagePayload extends PageData {
  isReadOnly: boolean;
  // PageData 中已包含 tags，无需重复添加
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
    tags: null, // **** 初始化 tags ****
    isReadOnly: true,
    isLoading: false,
    isInitialized: false,
    error: null,
    currentPageId: null,
  } as PageSliceState,

  reducers: (create) => ({
    // --- createPage Async Thunk (修改后) ---
    createPage: create.asyncThunk(
      async (
        // **** 添加可选的 title 和 addMomentTag 参数 ****
        args: {
          categoryId?: string;
          spaceId?: string;
          title?: string;
          addMomentTag?: boolean; // **** 新增参数 ****
        } = {},
        { dispatch, getState }
      ) => {
        // **** 获取 title 和 addMomentTag 参数 ****
        const {
          categoryId,
          spaceId: customSpaceId,
          title: initialTitle,
          addMomentTag, // **** 获取新参数 ****
        } = args;
        const state = getState() as NoloRootState;
        const userId = selectCurrentUserId(state);
        const effectiveSpaceId = customSpaceId || selectCurrentSpaceId(state);

        if (!userId) throw new Error("User ID not found.");

        const { dbKey, id } = createPageKey.create(userId);
        const title =
          initialTitle?.trim() || t("newPageTitle", { defaultValue: "新页面" });

        // **** 构建 tags 数组 ****
        const tags: string[] = [];
        if (addMomentTag) {
          tags.push("moment");
        }
        // 如果未来有其他添加 tags 的逻辑，可以在这里合并

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
          tags: tags.length > 0 ? tags : undefined, // **** 添加 tags 到数据对象 (仅在非空时添加) ****
          created: new Date().toISOString(),
          // updated_at 会在后续更新时添加
        };

        await dispatch(write({ data: pageData, customKey: dbKey })).unwrap();

        if (effectiveSpaceId) {
          // 假设 addContentToSpace 不需要显式传递 tags，
          // 如果需要，则需修改此处的调用：
          // dispatch(addContentToSpace({ ..., title, tags }));
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
        return dbKey; // 返回新页面的 key
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
            // PageData 已包含 tags，直接传递
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
          // 重置所有页面数据
          state.content = null;
          state.slateData = null;
          state.title = null;
          state.dbSpaceId = null;
          state.tags = null; // **** 重置 tags ****
          state.isReadOnly = true;
        },
        fulfilled: (state, action: PayloadAction<InitPagePayload>) => {
          state.isLoading = false;
          state.isInitialized = true;
          state.error = null;
          state.content = action.payload.content;
          state.slateData = action.payload.slateData;
          state.title = action.payload.title;
          state.dbSpaceId = action.payload.spaceId;
          state.tags = action.payload.tags || null; // **** 设置 tags ****
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
          // 发生错误时也重置数据
          state.content = null;
          state.slateData = null;
          state.title = null;
          state.dbSpaceId = null;
          state.tags = null; // **** 重置 tags ****
          state.isReadOnly = true;
          state.currentPageId = null;
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
      state.tags = null; // **** 重置 tags ****
      state.isReadOnly = true;
      state.isLoading = false;
      state.isInitialized = false;
      state.error = null;
      state.currentPageId = null;
    }),
    // 用于更新当前已加载页面的标题 (例如在编辑器中修改)
    updatePageTitle: create.reducer((state, action: PayloadAction<string>) => {
      if (state.isInitialized) {
        state.title = action.payload;
      }
    }),
    // (可选) 添加更新 tags 的 reducer (例如在编辑器中修改)
    updatePageTags: create.reducer((state, action: PayloadAction<string[]>) => {
      if (state.isInitialized) {
        state.tags = action.payload;
      }
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
    selectPageTags: (state: PageSliceState) => state.tags, // **** 添加 tags selector ****
  },
});

// 导出 Actions
export const {
  createPage,
  initPage,
  updateSlate,
  resetPage,
  toggleReadOnly,
  setReadOnly,
  updatePageTitle,
  updatePageTags, // **** 导出 (如果添加了) ****
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
  selectPageTags, // **** 导出 tags selector ****
} = pageSlice.selectors;

// 导出 Reducer
export default pageSlice.reducer;
