import { nolotusId } from "core/init";
import { Model } from "ai/llm/types";
import { getModelConfig } from "./getModelConfig";

// 定义基础接口
interface Usage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
}

interface ExternalPrice {
  input: number;
  output: number;
  creatorId?: string;
}

interface CalculatePriceParams {
  modelName: string;
  usage: Usage;
  externalPrice?: ExternalPrice;
  provider?: string;
  sharingLevel?: "default" | "split" | "full";
}

interface PriceResult {
  cost: number;
  pay: Record<string, number>;
}

interface CostBreakdown {
  regular: number;
  charge: number;
  details?: {
    inputCost: number;
    outputCost: number;
    cachingWriteCost: number;
    cachingReadCost: number;
  };
}

/**
 * 获取实际使用的价格
 */
const getEffectivePrices = (
  model: Model,
  externalPrice?: ExternalPrice
): {
  input: number;
  output: number;
  cachingWrite?: number;
  cachingRead?: number;
} => {
  const effectiveInputPrice = Math.max(
    externalPrice?.input || 0,
    model.price.input
  );
  const effectiveOutputPrice = Math.max(
    externalPrice?.output || 0,
    model.price.output
  );
  const effectiveCachingWritePrice = model.price.cachingWrite;
  const effectiveCachingReadPrice = model.price.cachingRead;

  return {
    input: effectiveInputPrice,
    output: effectiveOutputPrice,
    cachingWrite: effectiveCachingWritePrice,
    cachingRead: effectiveCachingReadPrice,
  };
};

/**
 * 计算Anthropic模型的成本
 */
const calculateAnthropicCost = (
  model: Model,
  usage: Usage,
  externalPrice?: ExternalPrice
): CostBreakdown => {
  const {
    input_tokens,
    output_tokens,
    cache_creation_input_tokens,
    cache_read_input_tokens,
  } = usage;
  const {
    input: effectiveInputPrice,
    output: effectiveOutputPrice,
    cachingWrite: effectiveCachingWritePrice,
    cachingRead: effectiveCachingReadPrice,
  } = getEffectivePrices(model, externalPrice);

  const regularInputTokens = input_tokens - cache_read_input_tokens;

  const regularInputCost = (regularInputTokens * model.price.input) / 1000000;
  const regularOutputCost = (output_tokens * model.price.output) / 1000000;
  const cachingWriteCost =
    (cache_creation_input_tokens * effectiveCachingWritePrice) / 1000000;
  const cachingReadCost =
    (cache_read_input_tokens * effectiveCachingReadPrice) / 1000000;

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
 * 计算OpenAI和DeepSeek模型的成本
 */
const calculateCacheBasedCost = (
  model: Model,
  usage: Usage,
  externalPrice?: ExternalPrice
): CostBreakdown => {
  const { input_tokens, output_tokens, cache_read_input_tokens } = usage;
  const { input: effectiveInputPrice, output: effectiveOutputPrice } =
    getEffectivePrices(model, externalPrice);

  const cacheMissTokens = input_tokens - cache_read_input_tokens;
  const effectiveCacheHitPrice = model.price.inputCacheHit;

  const regularCacheMissPrice = (cacheMissTokens * model.price.input) / 1000000;
  const regularCacheHitPrice =
    (cache_read_input_tokens * effectiveCacheHitPrice) / 1000000;
  const regularOutputPrice = (output_tokens * model.price.output) / 1000000;
  const regularTotal =
    regularCacheMissPrice + regularCacheHitPrice + regularOutputPrice;

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

/**
 * 计算简单模型的成本
 */
const calculateSimpleCost = (
  model: Model,
  usage: Usage,
  externalPrice?: ExternalPrice
): CostBreakdown => {
  const { input_tokens, output_tokens } = usage;
  const { input: effectiveInputPrice, output: effectiveOutputPrice } =
    getEffectivePrices(model, externalPrice);

  const regularInputCost = (input_tokens * model.price.input) / 1000000;
  const regularOutputCost = (output_tokens * model.price.output) / 1000000;
  const regularTotal = regularInputCost + regularOutputCost;

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

  switch (provider) {
    case "deepseek":
    case "openai":
      return calculateCacheBasedCost(model, usage, externalPrice);
    case "anthropic":
      return calculateAnthropicCost(model, usage, externalPrice);
    case "deepinfra":
    case "fireworks":
    case "mistral":
    case "google":
    case "xai":
    case "openrouter":
    case "sambanova":
      return calculateSimpleCost(model, usage, externalPrice);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
};

/**
 * 计算支付分配
 */
const calculatePayDistribution = (
  costs: CostBreakdown,
  externalPrice?: ExternalPrice,
  sharingLevel: "default" | "split" | "full"
): Record<string, number> => {
  const pay: Record<string, number> = {};
  const totalCost =
    costs.regular +
    (costs.details?.cachingWriteCost || 0) +
    (costs.details?.cachingReadCost || 0);

  pay[nolotusId] = totalCost;

  const sharingRatios = {
    default: 0,
    split: 0.5,
    full: 1,
  };

  if (externalPrice?.creatorId) {
    const profit = costs.charge - totalCost;
    switch (sharingLevel) {
      case "split":
        pay[externalPrice.creatorId] = profit * sharingRatios.split;
        break;
      case "full":
        pay[externalPrice.creatorId] = costs.charge;
        break;
      case "default":
      default:
        break;
    }
  }

  return Object.fromEntries(
    Object.entries(pay).map(([key, value]) => [key, Number(value.toFixed(6))])
  );
};

/**
 * 主函数：计算token使用的价格和分配
 */
export const calculatePrice = ({
  modelName,
  usage,
  externalPrice,
  provider = "anthropic",
  sharingLevel = "default",
}: CalculatePriceParams): PriceResult => {
  const model = getModelConfig(provider, modelName);

  const costs = calculateBasicCost(model, usage, provider, externalPrice);

  const pay = calculatePayDistribution(costs, externalPrice, sharingLevel);

  return {
    cost: Number(costs.regular.toFixed(6)),
    pay,
  };
};
