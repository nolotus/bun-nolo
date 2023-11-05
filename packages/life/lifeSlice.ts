// src/features/life/lifeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { nolotusDomain } from 'core/init';
import fetchReadAllData from 'database/client/readAll';
import { getLogger } from 'utils/logger';

const lifeLogger = getLogger('life');

// 定义错误信息
const ERR_FETCH_FAILED = 'Failed to fetch data from nolotus.com';
const ERR_BOTH_REQUESTS_FAILED = 'Both requests failed';

// 提取重复的代码到一个函数中
async function fetchDataFromDomain(domain, userId) {
  const res = await fetchReadAllData(domain, userId);
  if (!res) {
    throw new Error(ERR_FETCH_FAILED);
  }
  return res;
}
export const fetchData = createAsyncThunk(
  'life/fetchData',
  async (userId, thunkAPI) => {
    try {
      const isDevelopment = process.env.NODE_ENV === 'development';
      const currentDomain = isDevelopment
        ? 'localhost'
        : window.location.port
        ? `${window.location.hostname}:${window.location.port}`
        : `${window.location.hostname}`;
      const mainDomain = nolotusDomain[0];
      const isMainHost = currentDomain === mainDomain;

      if (isMainHost) {
        const res = await fetchDataFromDomain(mainDomain, userId);
        return res.map((item) => ({ ...item, source: 'both' }));
      } else {
        const [localData, nolotusData] = await Promise.all([
          fetchDataFromDomain(currentDomain, userId),
          fetchDataFromDomain(mainDomain, userId),
        ]);

        if (!localData && !nolotusData) {
          lifeLogger.error(ERR_BOTH_REQUESTS_FAILED);
          return thunkAPI.rejectWithValue(ERR_BOTH_REQUESTS_FAILED);
        }

        return mergeData(localData, nolotusData);
      }
    } catch (error) {
      lifeLogger.error(error);
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

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

// 将合并数据的逻辑拆分到一个单独的函数中
function mergeData(localData, nolotusData) {
  let mergedData = [];

  if (localData) {
    const nolotusKeys = nolotusData
      ? new Set(nolotusData.map((item) => item.key))
      : new Set();
    mergedData = localData.map((item) => ({
      ...item,
      source: nolotusKeys.has(item.key) ? 'both' : 'local',
    }));
  }

  if (nolotusData) {
    nolotusData.forEach((item) => {
      if (!mergedData.some((localItem) => localItem.key === item.key)) {
        mergedData.push({ ...item, source: 'nolotus' });
      }
    });
  }

  return mergedData;
}

function mergeNewData(existingData, newData, source) {
  const existingKeys = new Set(existingData.map((item) => item.key));
  const mergedData = [...existingData];

  newData.forEach((item) => {
    if (!existingKeys.has(item.key)) {
      mergedData.push({ ...item, source }); // 添加 source 属性
    }
  });

  return mergedData;
}

const lifeSlice = createSlice({
  name: 'life',
  initialState: {
    data: [],
    status: 'idle',
    error: null,
    filterType: '',
    excludeType: '',
    tokenStatistics: null,
    costs: null, // 新增状态
  },
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
        state.data = mergeNewData(state.data, action.payload, 'nolotus');

        // 合并数据并检查重复项
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
        state.data = mergeNewData(state.data, action.payload, 'local');
      })
      .addCase(fetchLocalData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});
export const { setFilterType, setExcludeType } = lifeSlice.actions;
export default lifeSlice.reducer;
