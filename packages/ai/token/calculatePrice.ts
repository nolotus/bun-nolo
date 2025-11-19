import { nolotusId } from "core/init";
import { Model, ModelPrice } from "ai/llm/types"; // 确保导入了更新后的 ModelPrice
import { getModelConfig } from "ai/llm/providers";

// ==================== 接口定义 ====================

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
  /**
   * regular (平台基础成本):
   * 这是我们需要支付给上游供应商（如 OpenAI, Google）的金额。
   * 计算基于模型的官方定价（包含阶梯定价）。
   */
  regular: number;

  /**
   * charge (用户实付金额):
   * 这是从用户余额中实际扣除的总金额。
   * 计算逻辑：Math.max(创作者设定的价格, 平台基础成本)。
   * 包含了基础成本 + 创作者的利润。
   */
  charge: number;

  details?: {
    inputCost: number;
    outputCost: number;
    cachingWriteCost: number;
    cachingReadCost: number;
  };
}

// ==================== 核心逻辑：阶梯定价解析 ====================

/**
 * 核心函数：解析当前应该使用的模型价格表
 * 自动处理 "tiered_context" (基于上下文长度的阶梯定价)
 */
const resolveModelPrice = (model: Model, usage: Usage): ModelPrice => {
  // 1. 默认使用基础价格 (Tier 1)
  let activePrice = { ...model.price };

  // 2. 检查是否配置了高级定价策略
  if (model.pricingStrategy?.type === "tiered_context") {
    const contextSize = usage.input_tokens || 0;
    const tiers = model.pricingStrategy.tiers || [];

    // 3. 遍历阶梯，寻找匹配的最高档位
    // 假设 tiers 配置可能无序，先按 minContext 从小到大排序
    const sortedTiers = [...tiers].sort((a, b) => a.minContext - b.minContext);

    for (const tier of sortedTiers) {
      if (contextSize >= tier.minContext) {
        // 如果当前上下文超过了阈值，使用该阶梯的价格覆盖默认价格
        activePrice = { ...tier.price };
      }
    }
  }

  return activePrice;
};

// ==================== 辅助逻辑：价格保护 ====================

/**
 * 获取用于向用户收费的"生效单价"
 * 逻辑：创作者设定的价格不能低于平台的成本价
 */
const getEffectivePrices = (
  resolvedPrice: ModelPrice, // 必须是解析后的真实成本价
  externalPrice?: ExternalPrice
): {
  input: number;
  output: number;
  cachingWrite: number;
  cachingRead: number;
} => {
  const effectiveInputPrice = Math.max(
    externalPrice?.input || 0,
    resolvedPrice.input
  );
  const effectiveOutputPrice = Math.max(
    externalPrice?.output || 0,
    resolvedPrice.output
  );

  return {
    input: effectiveInputPrice,
    output: effectiveOutputPrice,
    cachingWrite: resolvedPrice.cachingWrite || 0,
    cachingRead: resolvedPrice.cachingRead || 0,
  };
};

// ==================== 具体计算函数 ====================

/**
 * 策略 A: Anthropic 风格 (及 Google Gemini 3)
 * 特点：明确区分 Input / Output / Cache Write / Cache Read
 */
const calculateAnthropicCost = (
  resolvedPrice: ModelPrice, // 这里的价格已经根据阶梯调整过了
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
  } = getEffectivePrices(resolvedPrice, externalPrice);

  const regularInputTokens = input_tokens - cache_read_input_tokens;

  // --- 1. 计算 regular (平台成本) ---
  // 必须使用 resolvedPrice (官方原价)
  const regularTotal =
    (regularInputTokens * resolvedPrice.input +
      output_tokens * resolvedPrice.output +
      cache_creation_input_tokens * (resolvedPrice.cachingWrite || 0) +
      cache_read_input_tokens * (resolvedPrice.cachingRead || 0)) /
    1000000;

  // --- 2. 计算 charge (用户收费) ---
  // 必须使用 effectivePrice (含溢价)
  const chargeTotal =
    (regularInputTokens * effectiveInputPrice +
      output_tokens * effectiveOutputPrice +
      cache_creation_input_tokens * effectiveCachingWritePrice +
      cache_read_input_tokens * effectiveCachingReadPrice) /
    1000000;

  return {
    regular: regularTotal,
    charge: chargeTotal,
    details: {
      inputCost: (regularInputTokens * resolvedPrice.input) / 1000000,
      outputCost: (output_tokens * resolvedPrice.output) / 1000000,
      cachingWriteCost:
        (cache_creation_input_tokens * (resolvedPrice.cachingWrite || 0)) /
        1000000,
      cachingReadCost:
        (cache_read_input_tokens * (resolvedPrice.cachingRead || 0)) / 1000000,
    },
  };
};

/**
 * 策略 B: OpenAI / DeepSeek 风格
 * 特点：区分 Cache Miss (原价) 和 Cache Hit (折扣价)
 */
const calculateCacheBasedCost = (
  resolvedPrice: ModelPrice,
  usage: Usage,
  externalPrice?: ExternalPrice
): CostBreakdown => {
  const { input_tokens, output_tokens, cache_read_input_tokens } = usage;
  const { input: effectiveInputPrice, output: effectiveOutputPrice } =
    getEffectivePrices(resolvedPrice, externalPrice);

  const cacheMissTokens = input_tokens - cache_read_input_tokens;
  const cacheHitPrice = resolvedPrice.inputCacheHit || 0;

  // --- 1. regular (平台成本) ---
  const regularTotal =
    (cacheMissTokens * resolvedPrice.input +
      cache_read_input_tokens * cacheHitPrice +
      output_tokens * resolvedPrice.output) /
    1000000;

  // --- 2. charge (用户收费) ---
  // 注意：Cache Hit 通常不加价，保持原折扣价，除非业务有特殊需求
  const chargeTotal =
    (cacheMissTokens * effectiveInputPrice +
      cache_read_input_tokens * cacheHitPrice +
      output_tokens * effectiveOutputPrice) /
    1000000;

  return {
    regular: regularTotal,
    charge: chargeTotal,
    details: {
      inputCost: (cacheMissTokens * resolvedPrice.input) / 1000000,
      outputCost: (output_tokens * resolvedPrice.output) / 1000000,
      cachingReadCost: (cache_read_input_tokens * cacheHitPrice) / 1000000,
      cachingWriteCost: 0,
    },
  };
};

/**
 * 策略 C: 简单模型 (Simple)
 * 特点：只有 Input 和 Output
 */
const calculateSimpleCost = (
  resolvedPrice: ModelPrice,
  usage: Usage,
  externalPrice?: ExternalPrice
): CostBreakdown => {
  const { input_tokens, output_tokens } = usage;
  const { input: effectiveInputPrice, output: effectiveOutputPrice } =
    getEffectivePrices(resolvedPrice, externalPrice);

  // --- 1. regular (平台成本) ---
  const regularTotal =
    (input_tokens * resolvedPrice.input +
      output_tokens * resolvedPrice.output) /
    1000000;

  // --- 2. charge (用户收费) ---
  const chargeTotal =
    (input_tokens * effectiveInputPrice +
      output_tokens * effectiveOutputPrice) /
    1000000;

  return {
    regular: regularTotal,
    charge: chargeTotal,
    details: {
      inputCost: (input_tokens * resolvedPrice.input) / 1000000,
      outputCost: (output_tokens * resolvedPrice.output) / 1000000,
      cachingWriteCost: 0,
      cachingReadCost: 0,
    },
  };
};

// ==================== 路由与分发 ====================

/**
 * 根据 Provider 选择计算逻辑
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

  // [关键步骤]：根据 Usage 解析出当前的真实价格表 (处理阶梯定价)
  const resolvedPrice = resolveModelPrice(model, usage);

  switch (provider) {
    case "deepseek":
    case "openai":
      return calculateCacheBasedCost(resolvedPrice, usage, externalPrice);

    case "anthropic":
      return calculateAnthropicCost(resolvedPrice, usage, externalPrice);

    case "google":
      // Google Gemini 3 使用类似 Anthropic 的结构 (Input/Output/CW/CR)
      if (model.name.includes("gemini-3")) {
        return calculateAnthropicCost(resolvedPrice, usage, externalPrice);
      }
      // 旧版 Gemini 使用简单计费
      return calculateSimpleCost(resolvedPrice, usage, externalPrice);

    case "deepinfra":
    case "mistral":
    case "xai":
    case "openrouter":
    case "sambanova":
    default:
      return calculateSimpleCost(resolvedPrice, usage, externalPrice);
  }
};

/**
 * 计算收益分配
 */
const calculatePayDistribution = (
  costs: CostBreakdown,
  externalPrice?: ExternalPrice,
  sharingLevel: "default" | "split" | "full"
): Record<string, number> => {
  const pay: Record<string, number> = {};

  // 平台首先拿回"基础成本"
  pay[nolotusId] = costs.regular;

  const sharingRatios = {
    default: 0,
    split: 0.5,
    full: 1,
  };

  if (externalPrice?.creatorId) {
    // 利润 = 用户付的钱 (Charge) - 平台成本 (Regular)
    // 只有当有利润时才分润
    const profit = Math.max(0, costs.charge - costs.regular);

    if (profit > 0) {
      switch (sharingLevel) {
        case "split":
          pay[externalPrice.creatorId] = profit * sharingRatios.split;
          break;
        case "full":
          // Full 模式：创作者拿走全部利润
          pay[externalPrice.creatorId] = profit;
          break;
        default:
          break;
      }
    }
  }

  // 统一精度处理
  return Object.fromEntries(
    Object.entries(pay).map(([key, value]) => [key, Number(value.toFixed(6))])
  );
};

/**
 * 主入口函数
 */
export const calculatePrice = ({
  modelName,
  usage,
  externalPrice,
  provider = "anthropic",
  sharingLevel = "default",
}: CalculatePriceParams): PriceResult => {
  const model = getModelConfig(provider, modelName);

  // 1. 计算详细成本 (区分 Regular 和 Charge)
  const costs = calculateBasicCost(model, usage, provider, externalPrice);

  // 2. 计算分润
  const pay = calculatePayDistribution(costs, externalPrice, sharingLevel);

  return {
    // [重要] 返回 charge 作为本次交易的总金额 (扣除用户余额的数额)
    cost: Number(costs.charge.toFixed(6)),
    pay,
  };
};
