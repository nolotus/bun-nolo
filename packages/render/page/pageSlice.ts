import { createSlice } from "@reduxjs/toolkit";

export const pageSlice = createSlice({
  name: "page",
  initialState: {
    content: "",
    slateData: [],
  },
  reducers: {
    initPage: (state, action) => {
      // Update content with the incoming markdown
      state.content = action.payload.content;
      state.slateData = action.payload.slateData;
    },

    updateSlate: (state, action) => {
      const value = action.payload;
      state.slateData = value;
    },
    resetPage: (state) => {
      // 重置回初始状态
      state.content = "";
      state.slateData = [];
    },
  },
});

export const { initPage, updateSlate, resetPage } = pageSlice.actions;

export default pageSlice.reducer;
