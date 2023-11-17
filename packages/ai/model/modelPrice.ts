export type ModelPrice = {
    [key: string]: { input: number, output: number },
  };
  
export const modelPrice: ModelPrice = {
  'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
  'gpt-3.5-turbo-16k': { input: 0.003, output: 0.004 },
  'gpt-3.5-turbo-0613': { input: 0.0015, output: 0.002 },
  'gpt-3.5-turbo-16k-0613': { input: 0.003, output: 0.004 },
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-0613': { input: 0.03, output: 0.06 },
  'gpt-4-0314': { input: 0.03, output: 0.06 },
};
export const ModelPriceEnum = Object.keys(modelPrice).reduce((acc, key) => {
    acc[key] = key;
    return acc;
  }, {} as { [key: string]: string });