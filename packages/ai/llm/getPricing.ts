import { getModelsByProvider } from "ai/llm/providers";

interface ModelPricing {
  inputPrice: number;
  inputCacheHitPrice: number;
  outputPrice: number;
}

interface Prices {
  cybotInput: number;
  cybotOutput: number;
  serverInput: number;
  serverOutput: number;
}

const MAX_OUTPUT_TOKENS = 8192; // 单次返回最大 token 数

export const getModelPricing = (
  provider: string,
  modelName: string
): ModelPricing | null => {
  const models = getModelsByProvider(provider);
  const model = models.find((m) => m.name === modelName);

  if (!model?.price) return null;

  return {
    inputPrice: model.price.input,
    inputCacheHitPrice: model.price.inputCacheHit,
    outputPrice: model.price.output,
  };
};

export const getPrices = (config: any, serverPrices: any): Prices => ({
  cybotInput: Number(config?.inputPrice ?? 0),
  cybotOutput: Number(config?.outputPrice ?? 0),
  serverInput: Number(serverPrices?.inputPrice ?? 0),
  serverOutput: Number(serverPrices?.outputPrice ?? 0),
});

/**
 * 计算最终价格：
 * - 从所有价格中取「每百万 tokens 价格」的最大值
 * - 再换算成单 token 价格
 * - 再乘以最大输出 token 数
 */
export const getFinalPrice = (prices: Prices): number => {
  // 1. 取出所有价格字段
  const rawValues = Object.values(prices);

  // 2. 过滤出合法数字（去掉 NaN、Infinity、null/undefined 等）
  const validValues = rawValues.filter(
    (value) => typeof value === "number" && Number.isFinite(value)
  );

  // 3. 没有合法值时返回 0，避免 Math.max(...[]) 抛错
  if (validValues.length === 0) {
    return 0;
  }

  // 4. 找到每百万 token 的最高单价
  const maxPricePerMillion = Math.max(...validValues);

  // 5. 换算成单 token 价格
  const maxPricePerToken = maxPricePerMillion / 1_000_000;

  // 6. 计算 8192 个 token 的费用
  return maxPricePerToken * MAX_OUTPUT_TOKENS;
};
