import { anthropicModels } from "integrations/anthropic/anthropicModels";
import { deepSeekModels } from "integrations/deepseek/models";
import { openAIModels } from "integrations/openai/models";
import { nolotusId } from "core/init";
import { Model } from "ai/llm/types";
import { deepinfraModels } from "integrations/deepinfra/models";
import { fireworksmodels } from "integrations/fireworks/models";
import { mistralModels } from "integrations/mistral/models";

// 定义基础接口
interface Usage {
  // 总输入token数
  input_tokens: number;
  // 总输出token数
  output_tokens: number;
  // 缓存创建时使用的token数 (主要用于Anthropic)
  cache_creation_input_tokens: number;
  // 缓存命中时读取的token数
  cache_read_input_tokens: number;
}

interface ExternalPrice {
  // 外部设定的输入价格
  input: number;
  // 外部设定的输出价格
  output: number;
  // 创建者ID，用于收益分配
  creatorId?: string;
}

interface CalculatePriceParams {
  modelName: string;
  usage: Usage;
  externalPrice?: ExternalPrice;
  provider?: string;
  // 添加分成等级参数
  sharingLevel?: "default" | "split" | "full";
}

interface PriceResult {
  // 总成本
  cost: number;
  // 各方收益分配
  pay: Record<string, number>;
}

// 详细的成本计算结果
interface CostBreakdown {
  // 使用基础价格计算的成本
  regular: number;
  // 考虑外部价格后的实际收费
  charge: number;
  // 详细成本组成
  details?: {
    inputCost: number;
    outputCost: number;
    cachingWriteCost: number;
    cachingReadCost: number;
  };
}

/**
 * 获取指定provider和模型的配置
 * @throws Error 当provider或model不存在时
 */
const getModelConfig = (provider: string, modelName: string): Model => {
  const modelMap = {
    anthropic: anthropicModels,
    openai: openAIModels,
    deepseek: deepSeekModels,
    deepinfra: deepinfraModels,
    fireworks: fireworksmodels,
    mistral: mistralModels,
  };

  const models = modelMap[provider];
  if (!models) throw new Error(`Provider ${provider} not supported`);

  const model = models.find((m) => m.name === modelName);
  if (!model) throw new Error(`Model ${modelName} not found`);

  return model;
};

/**
 * Anthropic模型的成本计算
 * 特点：
 * 1. 使用独立的cachingWrite和cachingRead价格
 * 2. 支持外部价格覆盖
 */
const calculateAnthropicCost = (
  model: Model,
  usage: Usage,
  externalPrice?: ExternalPrice
): CostBreakdown => {
  const {
    input_tokens = 0,
    output_tokens = 0,
    cache_creation_input_tokens = 0,
    cache_read_input_tokens = 0,
  } = usage;

  // 计算实际需要使用基础输入价格的token数
  const regularInputTokens = input_tokens - cache_read_input_tokens;

  // 获取实际使用价格（考虑外部价格覆盖）
  const effectiveInputPrice = Math.max(
    externalPrice?.input || 0,
    model.price.input
  );
  const effectiveOutputPrice = Math.max(
    externalPrice?.output || 0,
    model.price.output
  );

  // 使用基础价格计算常规成本
  const regularInputCost = (regularInputTokens * model.price.input) / 1000000;
  const regularOutputCost = (output_tokens * model.price.output) / 1000000;
  const cachingWriteCost =
    (cache_creation_input_tokens * model.price.cachingWrite) / 1000000;
  const cachingReadCost =
    (cache_read_input_tokens * model.price.cachingRead) / 1000000;

  // 使用实际价格（包含外部价格）计算收费
  const chargeInputCost = (regularInputTokens * effectiveInputPrice) / 1000000;
  const chargeOutputCost = (output_tokens * effectiveOutputPrice) / 1000000;

  return {
    regular:
      regularInputCost + regularOutputCost + cachingWriteCost + cachingReadCost,
    charge:
      chargeInputCost + chargeOutputCost + cachingWriteCost + cachingReadCost,
    details: {
      inputCost: regularInputCost,
      outputCost: regularOutputCost,
      cachingWriteCost,
      cachingReadCost,
    },
  };
};

/**
 * OpenAI和DeepSeek模型的成本计算
 * 特点：
 * 1. 使用简化的缓存价格模型（只有inputCacheHit）
 * 2. 支持外部价格覆盖
 */
const calculateCacheBasedCost = (
  model: Model,
  usage: Usage,
  externalPrice?: ExternalPrice
): CostBreakdown => {
  const {
    input_tokens = 0,
    output_tokens = 0,
    cache_read_input_tokens = 0,
  } = usage;

  // 计算缓存未命中的token数
  const cacheMissTokens = input_tokens - cache_read_input_tokens;

  // 获取实际使用价格
  const effectiveInputPrice = Math.max(
    externalPrice?.input || 0,
    model.price.input
  );
  const effectiveOutputPrice = Math.max(
    externalPrice?.output || 0,
    model.price.output
  );
  const effectiveCacheHitPrice = model.price.inputCacheHit;

  // 使用基础价格计算
  const regularCacheMissPrice = (cacheMissTokens * model.price.input) / 1000000;
  const regularCacheHitPrice =
    (cache_read_input_tokens * effectiveCacheHitPrice) / 1000000;
  const regularOutputPrice = (output_tokens * model.price.output) / 1000000;
  const regularTotal =
    regularCacheMissPrice + regularCacheHitPrice + regularOutputPrice;

  // 使用实际价格计算（含外部价格）
  const chargeCacheMissPrice =
    (cacheMissTokens * effectiveInputPrice) / 1000000;
  const chargeCacheHitPrice =
    (cache_read_input_tokens * effectiveCacheHitPrice) / 1000000;
  const chargeOutputPrice = (output_tokens * effectiveOutputPrice) / 1000000;
  const chargeTotal =
    chargeCacheMissPrice + chargeCacheHitPrice + chargeOutputPrice;

  return {
    regular: regularTotal,
    charge: chargeTotal,
    details: {
      inputCost: regularCacheMissPrice,
      outputCost: regularOutputPrice,
      cachingReadCost: regularCacheHitPrice,
      cachingWriteCost: 0,
    },
  };
};

const calculateSimpleCost = (
  model: Model,
  usage: Usage,
  externalPrice?: ExternalPrice
): CostBreakdown => {
  const { input_tokens = 0, output_tokens = 0 } = usage;

  // 获取实际使用价格
  const effectiveInputPrice = Math.max(
    externalPrice?.input || 0,
    model.price.input
  );
  const effectiveOutputPrice = Math.max(
    externalPrice?.output || 0,
    model.price.output
  );

  // 基础价格计算
  const regularInputCost = (input_tokens * model.price.input) / 1000000;
  const regularOutputCost = (output_tokens * model.price.output) / 1000000;
  const regularTotal = regularInputCost + regularOutputCost;

  // 实际价格计算（考虑外部价格）
  const chargeInputCost = (input_tokens * effectiveInputPrice) / 1000000;
  const chargeOutputCost = (output_tokens * effectiveOutputPrice) / 1000000;
  const chargeTotal = chargeInputCost + chargeOutputCost;

  return {
    regular: regularTotal,
    charge: chargeTotal,
    details: {
      inputCost: regularInputCost,
      outputCost: regularOutputCost,
      cachingWriteCost: 0,
      cachingReadCost: 0,
    },
  };
};

/**
 * 根据provider选择对应的成本计算方法
 * Anthropic: 使用独立的缓存写入和读取价格
 * OpenAI/DeepSeek: 使用统一的缓存命中价格
 */
const calculateBasicCost = (
  model: Model,
  usage: Usage,
  provider: string,
  externalPrice?: ExternalPrice
): CostBreakdown => {
  if (!usage || typeof usage.input_tokens !== "number") {
    throw new Error("Invalid usage data");
  }

  // 根据provider的特性选择计算方法
  switch (provider) {
    case "deepseek":
    case "openai":
      return calculateCacheBasedCost(model, usage, externalPrice);
    case "anthropic":
      return calculateAnthropicCost(model, usage, externalPrice);
    case "deepinfra":
    case "fireworks":
    case "mistral":
      return calculateSimpleCost(model, usage, externalPrice);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
};

/**
 * 主函数：计算token使用的价格和分配
 * 步骤：
 * 1. 获取模型配置
 * 2. 计算基础成本
 * 3. 计算支付分配
 */
export const calculatePrice = ({
  modelName,
  usage,
  externalPrice,
  provider = "anthropic",
  sharingLevel = "default", // 默认分成等级为 'default'
}: CalculatePriceParams): PriceResult => {
  // 获取模型配置
  const model = getModelConfig(provider, modelName);

  // 计算基础成本
  const costs = calculateBasicCost(model, usage, provider, externalPrice);

  // 计算支付分配
  const pay: Record<string, number> = {};
  const totalCost =
    costs.regular +
    (costs.details?.cachingWriteCost || 0) +
    (costs.details?.cachingReadCost || 0);

  // 确保 nolotusId 获得总成本
  pay[nolotusId] = totalCost;

  // 定义分成规则
  const sharingRatios = {
    default: 0,
    split: 0.5, // 可以根据实际情况调整
    full: 1,
  };

  // 根据分成等级调整支付分配
  switch (sharingLevel) {
    case "split":
      if (externalPrice?.creatorId) {
        const profit = costs.charge - totalCost;
        pay[externalPrice.creatorId] = profit * sharingRatios.split;
      }
      break;
    case "full":
      if (externalPrice?.creatorId) {
        pay[externalPrice.creatorId] = costs.charge;
      }
      break;
    case "default":
    default:
      // 默认情况，所有利润归我们所有
      break;
  }

  // 将所有金额四舍五入到6位小数
  const roundedPay = Object.fromEntries(
    Object.entries(pay).map(([key, value]) => [key, Number(value.toFixed(6))])
  );

  return {
    cost: Number(totalCost.toFixed(6)),
    pay: roundedPay,
  };
};
