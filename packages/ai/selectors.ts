import { createSelector } from "@reduxjs/toolkit";
import { selectAllData } from "database/selectors";

import { modelPrice } from "./modelPrice";
import { DataType } from "create/types";

export const selectTokenStatisticsData = createSelector(
	[selectAllData],
	(data) => {
		// 在此处打印 data
		return data.filter(
			(item) => item.type === DataType.TokenStatistics || DataType.TokenStats,
		);
	},
);

export const selectTotalCosts = createSelector(
	[selectTokenStatisticsData],
	(tokenStatisticsData) => {
		let totalCost = 0;
		let modelCosts = {};
		let userCosts = {};
		console.log("tokenStatisticsData", tokenStatisticsData);
		for (let data of tokenStatisticsData) {
			if (!modelPrice[data.model]) {
				console.warn(`Unknown model price for model: ${data.model}`);
				continue; // 跳过未知模型
			}
			const direction_cost = data.dialogType === "send" ? "output" : "input";
			const cost =
				(modelPrice[data.model][direction_cost] * data.length) / 1000;

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
			if (!modelPrice[data.model]) {
				console.warn(`Unknown model price for model: ${data.model}`);
				continue;
			}

			const direction_cost = data.dialogType === "send" ? "output" : "input";
			const cost =
				(modelPrice[data.model][direction_cost] * data.length) / 1000;
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
