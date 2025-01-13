import { createSlice } from "@reduxjs/toolkit";

export const pageSlice = createSlice({
  name: "page",
  initialState: {
    content: "",
    slateData: [],
    title: null,
  },
  reducers: {
    initPage: (state, action) => {
      state.content = action.payload.content;
      state.slateData = action.payload.slateData;
    },

    updateSlate: (state, action) => {
      const value = action.payload;
      state.slateData = value;
    },
    resetPage: (state) => {
      state.content = "";
      state.slateData = [];
    },
  },
});

// 选择器
export const selectSlateData = (state) => state.page.slateData;
export const selectPageData = (state) => state.page;

export const { initPage, updateSlate, resetPage } = pageSlice.actions;

export default pageSlice.reducer;
