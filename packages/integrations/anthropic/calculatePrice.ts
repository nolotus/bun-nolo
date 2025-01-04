// calculatePrice.ts
import { anthropicModels } from "integrations/anthropic/anthropicModels";
import { deepSeekModels } from "integrations/deepseek/models";

import { nolotusId } from "core/init";

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
}

interface PriceResult {
  cost: number;
  pay: Record<string, number>;
}

export const calculatePrice = ({
  modelName,
  usage,
  externalPrice,
  provider = "anthropic",
}: CalculatePriceParams): PriceResult => {
  console.log("Calculate Price Input:", {
    modelName,
    usage,
    externalPrice,
    provider,
  });

  const {
    input_tokens = 0,
    output_tokens = 0,
    cache_creation_input_tokens = 0,
    cache_read_input_tokens = 0,
  } = usage;

  switch (provider) {
    case "anthropic": {
      const model = anthropicModels.find((m) => m.name === modelName);
      if (!model) {
        throw new Error(`Model ${modelName} not found`);
      }
      console.log("Found model:", model);

      // 计算常规请求成本
      const effectiveInputPrice =
        externalPrice?.input && externalPrice.input > model.price.input
          ? externalPrice.input
          : model.price.input;
      const effectiveOutputPrice =
        externalPrice?.output && externalPrice.output > model.price.output
          ? externalPrice.output
          : model.price.output;

      console.log("Prices:", {
        effectiveInputPrice,
        effectiveOutputPrice,
        modelInputPrice: model.price.input,
        modelOutputPrice: model.price.output,
      });

      const regularInputCost =
        (input_tokens - cache_creation_input_tokens - cache_read_input_tokens) *
        effectiveInputPrice;
      const regularOutputCost = output_tokens * effectiveOutputPrice;

      console.log("Regular costs before division:", {
        regularInputCost,
        regularOutputCost,
        tokens: {
          input: input_tokens,
          output: output_tokens,
          cacheCreation: cache_creation_input_tokens,
          cacheRead: cache_read_input_tokens,
        },
      });

      const regularCost = (regularInputCost + regularOutputCost) / 1000000;
      console.log("Regular cost after division:", regularCost);

      // 计算缓存写入成本
      const cachingWriteCost =
        (cache_creation_input_tokens * model.price.cachingWrite) / 1000000;
      console.log("Cache write cost:", cachingWriteCost);

      // 计算缓存读取成本
      const cachingReadCost =
        (cache_read_input_tokens * model.price.cachingRead) / 1000000;
      console.log("Cache read cost:", cachingReadCost);

      // 计算总成本
      const totalCost = regularCost + cachingWriteCost + cachingReadCost;
      console.log("Total cost:", totalCost);

      // 计算支付分配
      const pay: Record<string, number> = {};

      if (
        externalPrice?.creatorId &&
        (externalPrice.input > model.price.input ||
          externalPrice.output > model.price.output)
      ) {
        // 如果外部价格更高，分为两部分支付
        pay[nolotusId] =
          ((input_tokens -
            cache_creation_input_tokens -
            cache_read_input_tokens) *
            model.price.input +
            output_tokens * model.price.output) /
            1000000 +
          cachingWriteCost +
          cachingReadCost;

        pay[externalPrice.creatorId] = totalCost - pay[nolotusId];
        console.log("Pay distribution (external price):", pay);
      } else {
        // 如果使用默认价格，所有支付给nolotus
        pay[nolotusId] = totalCost;
        console.log("Pay distribution (default price):", pay);
      }

      return {
        cost: totalCost,
        pay,
      };
    }

    case "openai":
    case "deepseek": {
      const models = provider === "openai" ? openaiModels : deepSeekModels;
      const model = models.find((m) => m.name === modelName);
      if (!model) {
        throw new Error(`Model ${modelName} not found`);
      }
      console.log("Found model:", model);

      // 计算常规请求成本
      const totalCost =
        (input_tokens * model.price.input +
          output_tokens * model.price.output) /
        1000000;
      console.log("Total cost:", totalCost);

      const pay: Record<string, number> = {};
      // OpenAI/DeepSeek 的分成规则
      if (externalPrice?.creatorId) {
        pay[nolotusId] = totalCost * 0.8;
        pay[externalPrice.creatorId] = totalCost * 0.2;
        console.log("Pay distribution (with creator):", pay);
      } else {
        pay[nolotusId] = totalCost;
        console.log("Pay distribution (without creator):", pay);
      }

      return {
        cost: totalCost,
        pay,
      };
    }

    default:
      throw new Error(`Provider ${provider} not supported`);
  }
};
