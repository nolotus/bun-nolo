import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";

export const lifeAdapter = createEntityAdapter();
const initialState = lifeAdapter.getInitialState({
  filterType: "",
  excludeType: "",
  userIdFilter: "",
  sortKey: "", // 新增：用于筛选的键
  sortOrder: "asc", // 新增：排序顺序，默认为升序（asc）
  sourceFilter: "",
});
const lifeSlice = createSlice({
  name: "life",
  initialState,
  reducers: {
    setFilterType: (state, action) => {
      state.filterType = action.payload;
    },
    setSortKey: (state, action) => {
      state.sortKey = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    setSourceFilter: (state, action: PayloadAction<string>) => {
      state.sourceFilter = action.payload;
    },
  },
});
export const { setFilterType, setSortKey, setSortOrder, setSourceFilter } =
  lifeSlice.actions;
export default lifeSlice.reducer;
