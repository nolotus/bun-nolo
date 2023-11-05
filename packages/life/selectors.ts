import { createSelector } from '@reduxjs/toolkit';
import { calcCost } from 'ai/utils/calcCost';
export const selectFilterType = (state) => state.life.filterType;

import { lifeAdapter } from './lifeSlice';
export const selectAllLifeData = lifeAdapter.getSelectors(
  (state) => state.life,
).selectAll;

export const selectTokenStatisticsData = createSelector(
  [selectAllLifeData],
  (data) => {
    return data.filter(
      (item) => item.value && item.value.type === 'tokenStatistics',
    );
  },
);

export const selectCosts = createSelector([selectAllLifeData], (data) => {
  // 从数据中过滤出 tokenStatisticsData
  const tokenStatisticsData = data.filter(
    (item) => item.value && item.value.type === 'tokenStatistics',
  );

  // 计算 costs
  const values = tokenStatisticsData.map((item) => ({
    ...item.value,
    userId: item.value.userId,
  }));
  return calcCost(values);
});

export const selectFilteredLifeData = createSelector(
  [selectAllLifeData, selectFilterType],
  (data, filterType) => {
    let filteredData = data;

    if (filterType) {
      filteredData = filteredData.filter(
        (item) => item.value.type === filterType, // 直接使用 filterType 而不是 DataType[filterType as keyof typeof DataType]
      );
    }
    return filteredData;
  },
);
