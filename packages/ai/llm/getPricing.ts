// ai/llm/getPrice.ts
import { getModelsByProvider } from "ai/llm/providers";
import { pipe } from "rambda";

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

const MAX_OUTPUT_TOKENS = 8192 * 3; // Maximum tokens for single output

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

export const getFinalPrice = (prices: Prices): number => {
  // Find the highest price per token among all valid prices
  // These prices are originally based on 1M tokens cost
  const maxPricePerMillion = pipe(
    Object.values,
    (values) => values.filter((v) => !isNaN(v) && v !== null),
    (values) =>
      values.length ? values.reduce((acc, curr) => Math.max(acc, curr), 0) : 0
  )(prices);

  // Convert price from per 1M tokens to per token
  const maxPricePerToken = maxPricePerMillion / 1_000_000;

  // Calculate final price for maximum output tokens (8192 * 3)
  return maxPricePerToken * MAX_OUTPUT_TOKENS;
};
