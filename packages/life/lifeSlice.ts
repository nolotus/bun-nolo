import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

// 定义错误信息

//

export const lifeAdapter = createEntityAdapter();
const initialState = lifeAdapter.getInitialState({
  status: 'idle',
  error: null,
  filterType: '',
  excludeType: '',
});
const lifeSlice = createSlice({
  name: 'life',
  initialState,
  reducers: {
    setFilterType: (state, action) => {
      state.filterType = action.payload;
    },
  },
});
export const { setFilterType } = lifeSlice.actions;
export default lifeSlice.reducer;
