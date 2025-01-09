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

export const getModelPricing = (
  provider: string,
  modelName: string
): ModelPricing | null => {
  const models = getModelsByProvider(provider);
  console.log("models", models);
  console.log("modelName", modelName);

  const selectedModel = models.find((model) => model.name === modelName);
  console.log("selectedModel", selectedModel);

  if (!selectedModel?.price) {
    return null;
  }
  return {
    inputPrice: selectedModel.price.input,
    inputCacheHitPrice: selectedModel.price.inputCacheHit,
    outputPrice: selectedModel.price.output,
  };
};
export const getPrices = (config: any, serverPrices: any): Prices => ({
  cybotInput: Number(config?.inputPrice ?? 0),
  cybotOutput: Number(config?.outputPrice ?? 0),
  serverInput: Number(serverPrices?.inputPrice ?? 0),
  serverOutput: Number(serverPrices?.outputPrice ?? 0),
});

export const getFinalPrice = (prices: Prices): number =>
  pipe(
    Object.values,
    (values) => values.filter((v) => !isNaN(v) && v !== null),
    // 使用 R.reduce 来找最大值，更可靠
    (values) =>
      values.length ? values.reduce((acc, curr) => Math.max(acc, curr), 0) : 0
  )(prices);
