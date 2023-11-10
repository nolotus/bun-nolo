import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

export const lifeAdapter = createEntityAdapter();
const initialState = lifeAdapter.getInitialState({
  filterType: '',
  excludeType: '',
  userIdFilter: '',
});
const lifeSlice = createSlice({
  name: 'life',
  initialState,
  reducers: {
    setFilterType: (state, action) => {
      state.filterType = action.payload;
    },
    setUserIdFilter: (state, action) => {
      state.userIdFilter = action.payload;
    },
  },
});
export const { setFilterType, setUserIdFilter } = lifeSlice.actions;
export default lifeSlice.reducer;
