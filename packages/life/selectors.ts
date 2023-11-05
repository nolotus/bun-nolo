import { createSelector } from '@reduxjs/toolkit';
import { calcCost } from 'ai/utils/calcCost';

import { lifeAdapter } from './lifeSlice';

const selectAllLifeData = lifeAdapter.getSelectors(
  (state) => state.life,
).selectAll;

export const selectTokenStatisticsData = createSelector(
  // 第一个参数是输入选择器数组，它指定了从 Redux 状态中提取哪些数据
  [selectAllLifeData], // 使用 selectAll 方法替代直接访问 state.life.data
  // 第二个参数是结果函数，它接受输入选择器的输出，并计算和返回结果
  (data) => {
    return data.filter(
      (item) => item.value && item.value.type === 'tokenStatistics',
    );
  },
);

export const selectCosts = createSelector(
  // 第一个参数是输入选择器数组，它指定了从 Redux 状态中提取哪些数据
  [selectAllLifeData], // 使用 selectAll 方法替代直接访问 state.life.data
  // 第二个参数是结果函数，它接受输入选择器的输出，并计算和返回结果
  (data) => {
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
  },
);
