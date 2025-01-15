// ai/price/calculator.ts
import { pipe, curry } from "rambda";
import { nolotusId } from "core/init";
import { getModel } from "ai/llm/providers";
import {
  TokenUsage,
  PriceResult,
  CalculatePriceParams,
  ExternalPrice,
} from "./types";
// ai/price/calculator.ts

/**
 * 计算基础 token 成本和实际收费
 * @param model - 模型配置，包含基础价格
 * @param externalPrice - 外部定价配置（创建者设置的价格）
 * @param usage - token 使用情况
 * @returns 包含基础成本和实际收费的计算结果
 */
const calculateBasicTokenCosts = curry(
  (model, externalPrice, usage: TokenUsage) => {
    // 基础服务成本（按照模型原始价格）
    const baseCost = {
      input: (usage.input_tokens * model.price.input) / 1000000,
      output: (usage.output_tokens * model.price.output) / 1000000,
    };
    const totalBaseCost = baseCost.input + baseCost.output;

    // 实际收费（按照创建者设置的价格）
    const chargeCost = {
      input:
        (usage.input_tokens * (externalPrice?.input || model.price.input)) /
        1000000,
      output:
        (usage.output_tokens * (externalPrice?.output || model.price.output)) /
        1000000,
    };
    const totalChargeCost = chargeCost.input + chargeCost.output;

    // 利润 = 实际收费 - 基础成本
    const profit = totalChargeCost - totalBaseCost;

    // 是否定价合理（是否高于成本）
    const isPricingValid =
      (externalPrice?.input || 0) >= model.price.input &&
      (externalPrice?.output || 0) >= model.price.output;

    return {
      baseCost: totalBaseCost, // 基础服务成本
      chargeCost: totalChargeCost, // 实际收费
      profit, // 利润
      isPricingValid, // 定价是否合理
    };
  }
);

/**
 * 计算最终的支付分配
 * @param model - 模型配置
 * @param externalPrice - 外部定价配置
 * @param platformShare - 平台分成比例（0-1之间的小数）
 * @param costs - token 成本计算结果
 * @returns 最终的价格结果，包含总成本和支付分配
 */
const calculatePayment = curry(
  (model, externalPrice, platformShare = 0.2, costs) => {
    const pay: Record<string, number> = {};

    if (externalPrice?.creatorId && costs.isPricingValid) {
      // 只有当创建者存在且定价合理时才进行分成
      if (costs.profit > 0 && platformShare > 0) {
        // 有利润且平台参与分成
        pay[nolotusId] = costs.baseCost + costs.profit * platformShare;
        pay[externalPrice.creatorId] = costs.profit * (1 - platformShare);
      } else {
        // 没有利润或平台不参与分成
        pay[nolotusId] = costs.baseCost;
        pay[externalPrice.creatorId] = costs.chargeCost - costs.baseCost;
      }
    } else {
      // 如果定价不合理或没有创建者，所有收益归平台
      pay[nolotusId] = Math.max(costs.chargeCost, costs.baseCost);
    }

    return {
      cost: Math.max(costs.chargeCost, costs.baseCost), // 确保至少收取成本价
      pay,
    };
  }
);

/**
 * 统一的价格计算入口
 * @param modelName - 模型名称
 * @param usage - token 使用情况
 * @param externalPrice - 外部定价配置（可选）
 * @param provider - 供应商名称
 * @param platformShare - 平台分成比例（默认0.2，即20%）
 */
export const calculatePrice = ({
  modelName,
  usage,
  externalPrice,
  provider,
  platformShare = 0.2,
}: CalculatePriceParams): PriceResult => {
  const model = getModel(provider, modelName);

  return pipe(
    calculateBasicTokenCosts(model, externalPrice),
    calculatePayment(model, externalPrice, platformShare)
  )(usage);
};
