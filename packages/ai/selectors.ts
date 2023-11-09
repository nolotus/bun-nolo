import { createSelector } from '@reduxjs/toolkit';
import { calcCost } from 'ai/utils/calcCost';
import { selectAllData } from 'database/selectors';

export const selectCosts = createSelector([selectAllData], (data) => {
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
