import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from '@reduxjs/toolkit';
import fetchReadAllData from 'database/client/readAll';
import { getLogger } from 'utils/logger';

const lifeLogger = getLogger('life');

// 定义错误信息
const ERR_FETCH_FAILED = 'Failed to fetch data from nolotus.com';

//
async function fetchDataFromDomain(domain, userId) {
  const res = await fetchReadAllData(domain, userId);
  if (!res) {
    throw new Error(ERR_FETCH_FAILED);
  }
  return res;
}

export const fetchDataThunk = createAsyncThunk(
  'life/fetchData',
  async ({ userId, domain, source }, thunkAPI) => {
    try {
      const res = await fetchDataFromDomain(domain, userId);
      return { data: res.map((item) => ({ ...item, source })), source };
    } catch (error) {
      lifeLogger.error(error);
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

function mergeSource(existingItem, newSource) {
  if (existingItem) {
    const sourceSet = new Set(existingItem.source);
    sourceSet.add(newSource);
    return Array.from(sourceSet);
  } else {
    return [newSource];
  }
}

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchDataThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDataThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedData = action.payload.data.map((item) => {
          const existingItem = state.entities[item.id];
          return {
            ...item,
            source: mergeSource(existingItem, action.payload.source),
          };
        });
        lifeAdapter.upsertMany(state, updatedData);
      })
      .addCase(fetchDataThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});
export const { setFilterType } = lifeSlice.actions;
export default lifeSlice.reducer;
