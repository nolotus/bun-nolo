import { createSlice } from "@reduxjs/toolkit";

export const pageSlice = createSlice({
  name: "page",
  initialState: {
    content: "",
    slateData: [],
    title: null,
    isReadOnly: true,
  },
  reducers: {
    initPage: (state, action) => {
      state.content = action.payload.content;
      state.slateData = action.payload.slateData;
      state.isReadOnly = action.payload.isReadOnly;
    },

    updateSlate: (state, action) => {
      const value = action.payload;
      state.slateData = value;
    },

    // 添加切换 readonly 的 reducer
    toggleReadOnly: (state) => {
      state.isReadOnly = !state.isReadOnly;
    },

    // 直接设置 readonly 状态的 reducer
    setReadOnly: (state, action) => {
      state.isReadOnly = action.payload;
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
export const selectIsReadOnly = (state) => state.page.isReadOnly;

export const { initPage, updateSlate, resetPage, toggleReadOnly, setReadOnly } =
  pageSlice.actions;

export default pageSlice.reducer;
