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

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

// pageSlice.js
export const pageSlice = createSliceWithThunks({
  name: "page",
  initialState: {
    content: null,
    slateData: null,
    title: null,
    spaceId: null,
    isReadOnly: true,
  },
  reducers: (create) => ({
    createPage: create.asyncThunk(
      async ({ categoryId } = {}, { dispatch, getState }) => {
        // Modified: made categoryId optional with default empty object
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
              categoryId, // Will be undefined if not provided
            })
          );
        }

        return dbKey;
      }
    ),

    // 以下保持完全不变
    initPage: create.reducer((state, action) => {
      state.content = action.payload.content;
      state.slateData = action.payload.slateData;
      state.isReadOnly = action.payload.isReadOnly;
      state.title = action.payload.title;
      state.spaceId = action.payload.spaceId;
    }),

    updateSlate: create.reducer((state, action) => {
      state.slateData = action.payload;
    }),

    toggleReadOnly: create.reducer((state) => {
      state.isReadOnly = !state.isReadOnly;
    }),

    setReadOnly: create.reducer((state, action) => {
      state.isReadOnly = action.payload;
    }),

    resetPage: create.reducer((state) => {
      state.content = null;
      state.slateData = null;
      state.spaceId = null;
    }),
  }),
});

// 选择器
export const selectSlateData = (state) => state.page.slateData;
export const selectPageData = (state) => state.page; // 已包含 spaceId
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
