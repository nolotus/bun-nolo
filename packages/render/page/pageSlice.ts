// 文件路径: src/features/page/pageSlice.ts (或你的实际路径)

import {
  asyncThunkCreator,
  buildCreateSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
// --- 确认 addContentToSpace 导入自 spaceSlice ---

import { DataType } from "create/types"; // 确认路径
import { read } from "database/dbSlice"; // 确认路径
import { createPageAction } from "./createPageAction";
import { PageData } from "./types";

// --- 接口定义 ---

// 页面数据接口 (来自数据库)

// pageSlice 的 State 接口
interface PageSliceState {
  content: string | null;
  slateData: any | null;
  title: string | null;
  dbSpaceId: string | null; // 当前加载页面所属的 spaceId
  tags: string[] | null; // 当前加载页面的标签
  isReadOnly: boolean; // 当前页面是否只读
  isLoading: boolean; // 是否正在加载页面数据
  isInitialized: boolean; // 页面数据是否已成功初始化
  error: string | null; // 加载或操作错误信息
  currentPageId: string | null; // 当前加载页面的 dbKey
}

// initPage Thunk 的输入参数类型
interface InitPageArgs {
  pageId: string; // 要加载的页面的 dbKey
  isReadOnly: boolean; // 是否以只读模式打开
}

// initPage Thunk fulfilled action 的 payload 类型
interface InitPagePayload extends PageData {
  isReadOnly: boolean; // 包含只读状态
}

// --- Slice 创建器 ---
// 使用 Redux Toolkit 的 Slice 创建器，集成了异步 Thunk
const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

// --- pageSlice 定义 ---
export const pageSlice = createSliceWithThunks({
  name: "page", // Slice 名称
  initialState: {
    // 初始状态
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
  } as PageSliceState,

  reducers: (create) => ({
    // --- Thunks ---

    /**
     * 异步 Thunk: 创建一个新页面。
     * 1. 生成页面 Key 和 ID。
     * 2. 构建页面数据 (PageData)，包含标题、初始内容、标签等。
     * 3. 将页面数据写入数据库。
     * 4. 如果指定了 Space，则调用 addContentToSpace 将页面引用添加到 Space 中。
     *    - 在此步骤中，会将 "" 或 null/undefined 的 categoryId 转换为 undefined 再传递。
     */
    createPage: create.asyncThunk(
      createPageAction
      // 可以添加 .pending, .fulfilled, .rejected 来处理 Thunk 状态，但对于创建操作可能不是必须的
    ),

    /**
     * 异步 Thunk: 初始化页面编辑器状态。
     * 1. 从数据库读取指定 pageId 的数据。
     * 2. 验证数据类型是否为 PAGE。
     * 3. 更新 pageSlice 的 state 以反映加载的数据。
     */
    initPage: create.asyncThunk(
      async (args: InitPageArgs, { dispatch, rejectWithValue }) => {
        const { pageId, isReadOnly } = args;
        try {
          // 尝试从数据库读取页面数据
          const readAction = await dispatch(read(pageId));
          // 检查读取操作是否成功且有数据返回
          if (read.fulfilled.match(readAction) && readAction.payload) {
            const fetchedData = readAction.payload as PageData;
            // 验证数据类型
            if (fetchedData.type !== DataType.PAGE) {
              return rejectWithValue(
                `加载的内容 ${pageId} 不是一个有效的页面。`
              );
            }
            // 构造成功时的 payload，包含读取的数据和只读状态
            const resultPayload: InitPagePayload = {
              ...fetchedData,
              isReadOnly,
            };
            return resultPayload;
          } else {
            // 处理读取失败或数据为空的情况
            const errorMessage =
              (readAction.payload as any)?.message ||
              `无法加载页面 ${pageId} 的数据`;
            return rejectWithValue(errorMessage);
          }
        } catch (error: any) {
          // 处理读取过程中的意外错误
          return rejectWithValue(
            error.message || `初始化页面 ${pageId} 时发生意外错误`
          );
        }
      },
      {
        // Reducer for pending state (加载中)
        pending: (
          state,
          action: PayloadAction<undefined, string, { arg: InitPageArgs }>
        ) => {
          state.isLoading = true;
          state.isInitialized = false; // 重置初始化状态
          state.error = null;
          state.currentPageId = action.meta.arg.pageId; // 记录当前尝试加载的页面 ID
          // 重置页面相关数据
          state.content = null;
          state.slateData = null;
          state.title = null;
          state.dbSpaceId = null;
          state.tags = null;
          state.isReadOnly = action.meta.arg.isReadOnly; // 设置只读状态
        },
        // Reducer for fulfilled state (加载成功)
        fulfilled: (state, action: PayloadAction<InitPagePayload>) => {
          state.isLoading = false;
          state.isInitialized = true; // 标记为已初始化
          state.error = null;
          // 使用加载的数据更新 state
          state.content = action.payload.content;
          state.slateData = action.payload.slateData;
          state.title = action.payload.title;
          state.dbSpaceId = action.payload.spaceId;
          state.tags = action.payload.tags || null; // 处理 tags 可能为 undefined 的情况
          state.isReadOnly = action.payload.isReadOnly;
          state.currentPageId = action.payload.dbKey; // 确认当前加载的 ID
        },
        // Reducer for rejected state (加载失败)
        rejected: (state, action) => {
          state.isLoading = false;
          state.isInitialized = false; // 初始化失败
          state.error =
            (action.payload as string) ||
            action.error?.message ||
            "初始化页面时发生未知错误";
          // 重置页面数据
          state.content = null;
          state.slateData = null;
          state.title = null;
          state.dbSpaceId = null;
          state.tags = null;
          state.isReadOnly = true; // 默认设为只读
          state.currentPageId = null; // 清空当前页面 ID
        },
      }
    ),

    // --- 普通 Reducers ---

    /** 更新 Slate 编辑器数据 */
    updateSlate: create.reducer((state, action: PayloadAction<any>) => {
      // 只有在页面初始化后才允许更新，防止意外覆盖
      if (state.isInitialized) {
        state.slateData = action.payload;
      }
    }),

    /** 切换只读状态 */
    toggleReadOnly: create.reducer((state) => {
      state.isReadOnly = !state.isReadOnly;
    }),

    /** 设置只读状态 */
    setReadOnly: create.reducer((state, action: PayloadAction<boolean>) => {
      state.isReadOnly = action.payload;
    }),

    /** 重置页面状态 (例如离开页面时调用) */
    resetPage: create.reducer((state) => {
      // 恢复到初始状态
      state.content = null;
      state.slateData = null;
      state.title = null;
      state.dbSpaceId = null;
      state.tags = null;
      state.isReadOnly = true;
      state.isLoading = false;
      state.isInitialized = false;
      state.error = null;
      state.currentPageId = null;
    }),

    /**
     * 更新当前已加载页面的标题 (用于 UI 同步，不直接写入数据库)
     * 如果需要持久化，应配合调用一个保存 Thunk (例如 savePage)
     */
    updatePageTitle: create.reducer((state, action: PayloadAction<string>) => {
      if (state.isInitialized) {
        state.title = action.payload;
      }
    }),

    /**
     * 更新当前已加载页面的标签 (用于 UI 同步，不直接写入数据库)
     * 如果需要持久化，应配合调用一个保存 Thunk
     */
    updatePageTags: create.reducer((state, action: PayloadAction<string[]>) => {
      if (state.isInitialized) {
        state.tags = action.payload;
      }
    }),
  }),

  // --- Selectors ---
  // 定义用于从 state 中提取数据的选择器函数
  selectors: {
    selectSlateData: (state: PageSliceState) => state.slateData,
    selectPageData: (state: PageSliceState) => state, // 获取整个页面 slice state
    selectIsReadOnly: (state: PageSliceState) => state.isReadOnly,
    selectPageIsLoading: (state: PageSliceState) => state.isLoading,
    selectPageIsInitialized: (state: PageSliceState) => state.isInitialized,
    selectPageError: (state: PageSliceState) => state.error,
    selectCurrentPageTitle: (state: PageSliceState) => state.title,
    selectPageDbSpaceId: (state: PageSliceState) => state.dbSpaceId,
    selectCurrentPageId: (state: PageSliceState) => state.currentPageId,
    selectPageTags: (state: PageSliceState) => state.tags,
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
  updatePageTags,
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
  selectPageTags,
} = pageSlice.selectors;

// 导出 Reducer
export default pageSlice.reducer;
