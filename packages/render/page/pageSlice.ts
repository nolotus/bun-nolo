import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit";
import { selectCurrentUserId } from "auth/authSlice";
import { ParagraphType } from "create/editor/type";
import { DataType } from "create/types";
import { write } from "database/dbSlice";
import { createPageKey } from "database/keys";
import { t } from "i18next";
const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

export const pageSlice = createSliceWithThunks({
  name: "page",
  initialState: {
    content: null,
    slateData: null,
    title: null,
    isReadOnly: true,
  },
  reducers: (create) => ({
    createPage: create.asyncThunk(async (args, thunkApi) => {
      const state = thunkApi.getState();
      const userId = selectCurrentUserId(state);
      const id = createPageKey(userId);
      await thunkApi.dispatch(
        write({
          data: {
            id,
            type: DataType.PAGE,
            title: "新页面",
            slateData: [
              {
                type: ParagraphType,
                children: [{ text: t("introtext") }],
              },
            ],
            created: new Date().toISOString(),
          },
          customId: id,
        })
      );
      return id;
    }),
    initPage: create.reducer((state, action) => {
      state.content = action.payload.content;
      state.slateData = action.payload.slateData;
      state.isReadOnly = action.payload.isReadOnly;
      state.title = action.payload.title;
    }),

    updateSlate: create.reducer((state, action) => {
      const value = action.payload;
      state.slateData = value;
    }),

    // 添加切换 readonly 的 reducer
    toggleReadOnly: create.reducer((state) => {
      state.isReadOnly = !state.isReadOnly;
    }),

    // 直接设置 readonly 状态的 reducer
    setReadOnly: create.reducer((state, action) => {
      state.isReadOnly = action.payload;
    }),

    resetPage: create.reducer((state) => {
      state.content = null;
      state.slateData = null;
    }),
  }),
});

// 选择器
export const selectSlateData = (state) => state.page.slateData;
export const selectPageData = (state) => state.page;
export const selectIsReadOnly = (state) => state.page.isReadOnly;

export const {
  initPage,
  createPage,
  updateSlate,
  resetPage,
  toggleReadOnly,
  setReadOnly,
} = pageSlice.actions;

export default pageSlice.reducer;

