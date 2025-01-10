// ai/llm/getPrice
import { getModelsByProvider } from "ai/llm/providers";
import { pipe, tap } from "rambda";

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

  const selectedModel = models.find((model) => model.name === modelName);

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
    tap((input) => console.log("Input prices:", input)),
    Object.values,
    tap((values) => console.log("After Object.values:", values)),
    (values) => values.filter((v) => !isNaN(v) && v !== null),
    tap((filtered) => console.log("After filter:", filtered)),
    (values) =>
      values.length ? values.reduce((acc, curr) => Math.max(acc, curr), 0) : 0,
    tap((result) => console.log("Final result:", result))
  )(prices);
