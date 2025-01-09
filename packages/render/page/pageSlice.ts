import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DataType } from "create/types";

export const pageSlice = createSlice({
  name: "page",
  initialState: {
    content: "",
    createdTime: "",
    meta: {
      type: DataType.PAGE,
      creator: "",
      title: "",
      layout: "default",
      categories: [],
      tags: [],
    },
    slateData: [],
  },
  reducers: {
    initPage: (state, action: PayloadAction<string>) => {
      // Update content with the incoming markdown
      state.content = action.payload.content;
      state.meta.type = action.payload.type;
      state.meta.title = action.payload.title;
      state.slateData = action.payload.slateData;
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
        type: DataType.PAGE,
        creator: "",
        title: "",
        layout: "default",
        categories: [],
        tags: [],
      };
      state.slateData = [];
    },
  },
});

export const { initPage, updateSlate, resetPage } = pageSlice.actions;

export default pageSlice.reducer;
