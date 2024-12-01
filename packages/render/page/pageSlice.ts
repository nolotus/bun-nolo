import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DataType } from "create/types";
import {
  markdownToMdast,
  getH1TextFromMdast,
} from "render/processor/MarkdownProcessor";
import { parse } from "yaml";

export const pageSlice = createSlice({
  name: "page",
  initialState: {
    content: "",
    hasVersion: false,
    createdTime: "",
    mdast: { type: "root", children: [] },
    meta: {
      type: DataType.Page,
      creator: "",
      title: "",
      layout: "default",
      categories: [],
      tags: [],
    },
    saveAsTemplate: false,
  },
  reducers: {
    setHasVersion: (state, action) => {
      state.hasVersion = action.payload;
    },

    setCreator: (state, action) => {
      state.creator = action.payload;
    },

    initPage: (state, action: PayloadAction<string>) => {
      // Update content with the incoming markdown
      state.saveAsTemplate = action.payload.is_template;
      state.content = action.payload.content;
      state.meta.type = action.payload.type;
      state.meta.title = action.payload.title;
      // Convert markdown to mdast
      const mdast = markdownToMdast(action.payload.content);
      // Update the mdast state
      state.mdast = mdast;
    },
    initPageFromTemplate: (state, action: PayloadAction<string>) => {
      // Update content with the incoming markdown
      state.content = action.payload.content;
      state.meta.type = action.payload.type;
      state.meta.title = action.payload.title;
      // Convert markdown to mdast
      const mdast = markdownToMdast(action.payload.content);
      // Update the mdast state
      state.mdast = mdast;
    },
    updateContent: (
      state,
      action: PayloadAction<{ content: string; metaUpdates: any; mdast?: any }>,
    ) => {
      state.content = action.payload.content;

      // 从新的 content 解析更新 mdast
      if (action.payload.mdast) {
        state.mdast = action.payload.mdast;
      }

      // 从 mdast 中提取并更新 title
      const newTitle = getH1TextFromMdast(action.payload.mdast);
      if (newTitle) {
        state.meta.title = newTitle;
      }
      if (action.payload.metaUpdates) {
        state.meta = {
          ...state.meta,
          ...action.payload.metaUpdates,
        };
      }
    },
    setSaveAsTemplate(state, action: PayloadAction<boolean>) {
      state.saveAsTemplate = action.payload;
    },
  },
});

export const {
  setHasVersion,
  initPage,
  initPageFromTemplate,
  updateContent,
  setSaveAsTemplate,
} = pageSlice.actions;

export default pageSlice.reducer;
