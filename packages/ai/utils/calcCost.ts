import {Dialog, ModelPrice} from '../types';
export const modelPrice: ModelPrice = {
  'gpt-3.5-turbo': {input: 0.0015, output: 0.002},
  'gpt-3.5-turbo-16k': {input: 0.003, output: 0.004},
  'gpt-3.5-turbo-0613': {input: 0.0015, output: 0.002},
  'gpt-3.5-turbo-16k-0613': {input: 0.003, output: 0.004},
  'gpt-4': {input: 0.03, output: 0.06},
  'gpt-4-0613': {input: 0.03, output: 0.06},
  'gpt-4-0314': {input: 0.03, output: 0.06},
};

export function calcCost(dataList: Dialog[]): any {
  let totalCost = 0;
  let modelCosts: {[key: string]: any} = {}; // 存储各个模型的总成本
  let userCosts: {[key: string]: any} = {}; // 新增：存储每个用户的成本信息

  for (let data of dataList) {
    const direction_cost = data.dialogType === 'send' ? 'output' : 'input';
    const cost = (modelPrice[data.model][direction_cost] * data.length) / 1000;
    totalCost += cost;

    if (!modelCosts[data.model]) {
      modelCosts[data.model] = {output: 0, input: 0};
    }
    modelCosts[data.model][direction_cost] += cost;

    // 新增：判断和累加对应用户的成本信息
    if (!userCosts[data.userId]) {
      userCosts[data.userId] = {
        total: 0,
        modelCosts: {},
        username: data.username,
      }; // 添加username属性
    }
    if (!userCosts[data.userId].modelCosts[data.model]) {
      userCosts[data.userId].modelCosts[data.model] = {output: 0, input: 0};
    }
    userCosts[data.userId].total += cost;
    userCosts[data.userId].modelCosts[data.model][direction_cost] += cost;
  }

  return {
    totalCost: totalCost,
    modelCosts: modelCosts,
    userCosts: userCosts, // 新增：返回每个用户的成本信息
  };
}

export function calcCurrentUserIdCost(
  dataList: Dialog[],
  currentUserId: string,
): any {
  let totalCost = 0;
  let modelCosts: {[key: string]: any} = {}; // 存储各个模型的总成本

  for (let data of dataList) {
    if (data.userId !== currentUserId) {
      continue; // 只计算当前用户的成本
    }

    const direction_cost = data.dialogType === 'send' ? 'output' : 'input';
    const cost = (modelPrice[data.model][direction_cost] * data.length) / 1000;
    totalCost += cost;

    if (!modelCosts[data.model]) {
      modelCosts[data.model] = {output: 0, input: 0};
    }
    modelCosts[data.model][direction_cost] += cost;
  }

  return {
    totalCost: totalCost,
    modelCosts: modelCosts,
  };
}
