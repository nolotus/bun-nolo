// dbSlice.js
import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { getLogger } from 'utils/logger';

import { dbApi } from './services'; // 确保从正确的位置导入 dbApi

const logger = getLogger('db');

// Entity adapter
const dbAdapter = createEntityAdapter();

// Initial state
const initialState = dbAdapter.getInitialState({
  status: 'idle',
  error: null,
});

// Async thunk
export const fetchReadAllData = createAsyncThunk(
  'db/fetchReadAll',
  async ({ userId }, { rejectWithValue }) => {
    try {
      const response = await dbApi.endpoints.readAll.initiate(userId);
      return response.data;
    } catch (error) {
      logger.error(error);
      return rejectWithValue(error.message);
    }
  },
);

// Slice
const dbSlice = createSlice({
  name: 'db',
  initialState,
  reducers: {
    // ...可能的其他reducers
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReadAllData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReadAllData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        dbAdapter.setAll(state, action.payload);
      })
      .addCase(fetchReadAllData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const {} = dbSlice.actions;
export default dbSlice.reducer;
