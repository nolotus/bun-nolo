import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DataType } from "create/types";

export const pageSlice = createSlice({
  name: "page",
  initialState: {
    content: "",
    createdTime: "",
    meta: {
      type: DataType.Page,
      creator: "",
      title: "",
      layout: "default",
      categories: [],
      tags: [],
    },
    saveAsTemplate: false,
    slateData: [],
  },
  reducers: {
    initPage: (state, action: PayloadAction<string>) => {
      // Update content with the incoming markdown
      state.saveAsTemplate = action.payload.is_template;
      state.content = action.payload.content;
      state.meta.type = action.payload.type;
      state.meta.title = action.payload.title;
      state.slateData = action.payload.slateData;
    },
    initPageFromTemplate: (state, action: PayloadAction<string>) => {
      // Update content with the incoming markdown
      state.content = action.payload.content;
      state.meta.type = action.payload.type;
      state.meta.title = action.payload.title;
    },
    updateContent: (
      state,
      action: PayloadAction<{ content: string; metaUpdates: any }>
    ) => {
      state.content = action.payload.content;
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
    updateSlate: (state, action) => {
      const value = action.payload;
      state.slateData = value;
    },
    resetPage: (state) => {
      // 重置回初始状态
      state.content = "";
      state.createdTime = "";
      state.meta = {
        type: DataType.Page,
        creator: "",
        title: "",
        layout: "default",
        categories: [],
        tags: [],
      };
      state.saveAsTemplate = false;
      state.slateData = [];
    },
  },
});

export const {
  initPage,
  initPageFromTemplate,
  updateContent,
  setSaveAsTemplate,
  updateSlate,
  resetPage,
} = pageSlice.actions;

export default pageSlice.reducer;
