import { DataType } from "create/types";
import { extractUserId } from "core/prefix";

import { saveTokenUsage } from "ai/token/db";
import { TokenUsageData } from "ai/token/types";
import { normalizeUsage } from "ai/token/normalizeUsage";
import { calculatePrice } from "ai/token/calculatePrice";

// 示例使用 updateTokensAction 函数时的数据结构

export const updateTokensAction = async (
  { dialogId, usage: usageRaw, cybotConfig },
  thunkApi
) => {
  const state = thunkApi.getState();
  const auth = state.auth;

  const provider = cybotConfig.provider;
  const creatorId = extractUserId(cybotConfig.id);

  const externalPrice = {
    input: cybotConfig.inputPrice,
    output: cybotConfig.outputPrice,
    creatorId,
  };

  console.log("externalPrice", externalPrice);
  const usage = normalizeUsage(usageRaw);

  const result = calculatePrice({
    provider,
    modelName: cybotConfig.model,
    usage,
    externalPrice,
  });

  const data: TokenUsageData = {
    ...usage,
    userId: auth?.currentUser?.userId,
    cybotId: cybotConfig.id,
    model: cybotConfig.model,
    provider: cybotConfig.provider,
    date: new Date(),
    type: DataType.TOKEN,
    dialogId,
    cost: result.cost,
    pay: result.pay,
  };

  try {
    await saveTokenUsage(data);
  } catch (error) {
    console.error("Failed to save token usage:", error);
    throw error;
  }
  return {
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
  };
};
