import { createSelector } from "@reduxjs/toolkit";

import { DataType } from "create/types";
import { selectAll } from "database/dbSlice";

import { allModels } from "./llm/models";

export const selectTokenStatisticsData = createSelector([selectAll], (data) => {
  return data.filter((item) => item.type === DataType.TokenStats);
});

export const selectTotalCosts = createSelector(
  [selectTokenStatisticsData],
  (tokenStatisticsData) => {
    let totalCost = 0;
    let modelCosts = {};
    let userCosts = {};
    for (let data of tokenStatisticsData) {
      if (!allModels[data.model]) {
        console.warn(`Unknown model price for model: ${data.model}`);
        continue; // 跳过未知模型
      }
      const direction_cost = data.dialogType === "send" ? "output" : "input";
      const cost = (allModels[data.model][direction_cost] * data.length) / 1000;

      totalCost += cost;

      if (!modelCosts[data.model]) {
        modelCosts[data.model] = { output: 0, input: 0 };
      }
      modelCosts[data.model][direction_cost] += cost;

      if (!userCosts[data.userId]) {
        userCosts[data.userId] = {
          total: 0,
          modelCosts: {},
          username: data.username, // 确保 username 字段存在于数据中
        };
      }
      if (!userCosts[data.userId].modelCosts[data.model]) {
        userCosts[data.userId].modelCosts[data.model] = { output: 0, input: 0 };
      }
      userCosts[data.userId].total += cost;
      userCosts[data.userId].modelCosts[data.model][direction_cost] += cost;
    }

    return {
      totalCost,
      modelCosts,
      userCosts,
    };
  },
);
export const selectCostByUserId = createSelector(
  [selectTokenStatisticsData, (state) => state.auth.currentUser.userId],
  (tokenStatisticsData, userId) => {
    let totalCost = 0;
    let modelCosts = {};

    for (let data of tokenStatisticsData) {
      if (data.userId !== userId) {
        continue;
      }
      if (!allModels[data.model]) {
        console.warn(`Unknown model price for model: ${data.model}`);
        continue;
      }

      const direction_cost = data.dialogType === "send" ? "output" : "input";
      const cost = (allModels[data.model][direction_cost] * data.length) / 1000;
      totalCost += cost;

      if (!modelCosts[data.model]) {
        modelCosts[data.model] = { output: 0, input: 0 };
      }
      modelCosts[data.model][direction_cost] += cost;
    }

    return {
      totalCost,
      modelCosts,
    };
  },
);
