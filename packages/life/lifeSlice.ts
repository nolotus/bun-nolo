import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

export const lifeAdapter = createEntityAdapter();
const initialState = lifeAdapter.getInitialState({
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
