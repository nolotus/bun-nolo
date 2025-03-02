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

export const pageSlice = createSliceWithThunks({
  name: "page",
  initialState: {
    content: null,
    slateData: null,
    title: null,
    spaceId: null, // 新增 spaceId 字段
    isReadOnly: true,
  },
  reducers: (create) => ({
    createPage: create.asyncThunk(async (args, thunkApi) => {
      const dispatch = thunkApi.dispatch;
      const state = thunkApi.getState();
      const userId = selectCurrentUserId(state);
      const { dbKey, id } = createPageKey.create(userId);
      const title = "新页面";
      const currentSpaceId = selectCurrentSpaceId(state); // 获取当前空间 ID

      // 写入页面数据，包含 spaceId
      await dispatch(
        write({
          data: {
            dbKey,
            id,
            type: DataType.PAGE,
            title,
            spaceId: currentSpaceId, // 添加 spaceId
            slateData: [
              {
                type: ParagraphType,
                children: [{ text: t("introtext") }],
              },
            ],
            created: new Date().toISOString(),
          },
          customKey: dbKey,
        })
      );

      // 如果有空间，添加内容到空间
      if (currentSpaceId) {
        dispatch(
          addContentToSpace({
            contentKey: dbKey,
            type: DataType.PAGE,
            spaceId: currentSpaceId,
            title,
          })
        );
      }

      return dbKey;
    }),

    initPage: create.reducer((state, action) => {
      state.content = action.payload.content;
      state.slateData = action.payload.slateData;
      state.isReadOnly = action.payload.isReadOnly;
      state.title = action.payload.title;
      state.spaceId = action.payload.spaceId; // 保存 spaceId
    }),

    updateSlate: create.reducer((state, action) => {
      const value = action.payload;
      state.slateData = value;
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
      state.spaceId = null; // 重置时清空 spaceId
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
