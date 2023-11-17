import { createSelector } from '@reduxjs/toolkit';
import { calcCost } from 'ai/utils/calcCost';
import { selectAllData } from 'database/selectors';

export const selectCosts = createSelector([selectAllData], (data) => {
  try {
    const tokenStatisticsData = data.filter(
      (item) => item.value && item.value.type === 'tokenStatistics',
    );

    const values = tokenStatisticsData.map((item) => ({
      ...item.value,
      userId: item.value.userId,
    }));

    return calcCost(values);
  } catch (error) {
    console.error('Error in selectCosts:', error);
    return []; // 或者返回一个适当的默认值/错误标志
  }
});
