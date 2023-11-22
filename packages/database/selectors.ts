import { createSelector } from '@reduxjs/toolkit';

export const selectFilterType = (state) => state.life.filterType;

import { dbAdapter } from './dbSlice';
export const selectAllData = dbAdapter.getSelectors(
  (state) => state.db,
).selectAll;

// 使用 createSelector 来创建一个基于 selectAllData 的 memoized selector
export const selectPages = createSelector(
  [selectAllData], // 这是输入 selector
  (allData) => allData.filter((item) => item.value.type === 'page'), // 这是一个 transform function
);
