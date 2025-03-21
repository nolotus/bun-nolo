import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit";
import { selectCurrentUserId } from "auth/authSlice";
import { ParagraphType } from "create/editor/type";
import {
  addContentToSpace,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";
import { DataType } from "create/types";
import { write } from "database/dbSlice";
import { createPageKey } from "database/keys";
import { t } from "i18next";

// 创建带 thunk 的 slice
const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

// 定义状态类型
interface PageState {
  content: any | null;
  slateData: any | null;
  title: string | null;
  spaceId: string | null;
  isReadOnly: boolean;
}

// 定义 createPage 的参数类型
interface CreatePageArgs {
  categoryId?: string;
}

// 初始化状态
const initialState: PageState = {
  content: null,
  slateData: null,
  title: null,
  spaceId: null,
  isReadOnly: true,
};

// 创建 page slice
export const pageSlice = createSliceWithThunks({
  name: "page",
  initialState,
  reducers: (create) => ({
    // 创建新页面
    createPage: create.asyncThunk<string, CreatePageArgs>(
      async ({ categoryId }, { dispatch, getState }) => {
        const state = getState();
        const userId = selectCurrentUserId(state);
        const spaceId = selectCurrentSpaceId(state);
        const { dbKey, id } = createPageKey.create(userId);
        const title = t("newPageTitle", { defaultValue: "新页面" });

        // 页面数据
        const pageData = {
          dbKey,
          id,
          type: DataType.PAGE,
          title,
          spaceId,
          slateData: [
            {
              type: ParagraphType,
              children: [{ text: t("introtext") }],
            },
          ],
          created: new Date().toISOString(),
        };

        // 写入数据库
        await dispatch(write({ data: pageData, customKey: dbKey })).unwrap();

        // 如果有空间ID，将页面添加到空间
        if (spaceId) {
          dispatch(
            addContentToSpace({
              contentKey: dbKey,
              type: DataType.PAGE,
              spaceId,
              title,
              categoryId,
            })
          );
        }

        return dbKey;
      }
    ),

    // 初始化页面
    initPage: create.reducer((state, action: { payload: PageState }) => {
      return { ...state, ...action.payload };
    }),

    // 更新 Slate 数据
    updateSlate: create.reducer((state, action: { payload: any }) => {
      state.slateData = action.payload;
    }),

    // 切换只读模式
    toggleReadOnly: create.reducer((state) => {
      state.isReadOnly = !state.isReadOnly;
    }),

    // 设置只读模式
    setReadOnly: create.reducer((state, action: { payload: boolean }) => {
      state.isReadOnly = action.payload;
    }),

    // 重置页面状态
    resetPage: create.reducer(() => initialState),
  }),
});

// 选择器
export const selectSlateData = (state: any) => state.page.slateData;
export const selectPageData = (state: any) => state.page;
export const selectIsReadOnly = (state: any) => state.page.isReadOnly;

// 导出 actions
export const {
  initPage,
  createPage,
  updateSlate,
  resetPage,
  toggleReadOnly,
  setReadOnly,
} = pageSlice.actions;

export default pageSlice.reducer;
