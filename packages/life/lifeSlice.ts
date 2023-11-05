// src/features/life/lifeSlice.js
import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from '@reduxjs/toolkit';
import { nolotusDomain } from 'core/init';
import fetchReadAllData from 'database/client/readAll';
import { getLogger } from 'utils/logger';

const lifeLogger = getLogger('life');

// 定义错误信息
const ERR_FETCH_FAILED = 'Failed to fetch data from nolotus.com';

// 提取重复的代码到一个函数中
async function fetchDataFromDomain(domain, userId) {
  const res = await fetchReadAllData(domain, userId);
  if (!res) {
    throw new Error(ERR_FETCH_FAILED);
  }
  return res;
}

export const fetchNolotusData = createAsyncThunk(
  'life/fetchNolotusData',
  async (userId, thunkAPI) => {
    try {
      const mainDomain = nolotusDomain[0];
      const res = await fetchDataFromDomain(mainDomain, userId);
      return res.map((item) => ({ ...item, source: 'nolotus' }));
    } catch (error) {
      lifeLogger.error(error);
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const fetchLocalData = createAsyncThunk(
  'life/fetchLocalData',
  async (userId, thunkAPI) => {
    try {
      const isDevelopment = process.env.NODE_ENV === 'development';
      const currentDomain = isDevelopment
        ? 'localhost'
        : window.location.port
        ? `${window.location.hostname}:${window.location.port}`
        : `${window.location.hostname}`;
      const res = await fetchDataFromDomain(currentDomain, userId);
      return res.map((item) => ({ ...item, source: 'local' }));
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
    setExcludeType: (state, action) => {
      state.excludeType = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNolotusData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNolotusData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedData = action.payload.map((item) => {
          const existingItem = state.entities[item.id];
          return {
            ...item,
            source: mergeSource(existingItem, 'nolotus'),
          };
        });
        lifeAdapter.upsertMany(state, updatedData);
      })
      .addCase(fetchNolotusData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchLocalData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLocalData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedData = action.payload.map((item) => {
          const existingItem = state.entities[item.id];
          return {
            ...item,
            source: mergeSource(existingItem, 'local'),
          };
        });
        lifeAdapter.upsertMany(state, updatedData);
      })
      .addCase(fetchLocalData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});
export const { setFilterType, setExcludeType } = lifeSlice.actions;
export default lifeSlice.reducer;
