import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";

export const lifeAdapter = createEntityAdapter();
const initialState = lifeAdapter.getInitialState({
  sortKey: "", // 新增：用于筛选的键
  sortOrder: "asc", // 新增：排序顺序，默认为升序（asc）
});
const lifeSlice = createSlice({
  name: "life",
  initialState,
  reducers: {
    setSortKey: (state, action) => {
      state.sortKey = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
  },
});
export const { setSortKey, setSortOrder } = lifeSlice.actions;
export default lifeSlice.reducer;
