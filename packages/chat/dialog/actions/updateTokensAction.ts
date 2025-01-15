import { nolotusId } from "core/init";
import { DataType } from "create/types";
import { calculatePrice } from "integrations/anthropic/calculatePrice";
import { extractUserId } from "core/prefix";

import { saveTokenUsage } from "ai/token/db";
import { TokenUsageData } from "ai/token/types";
import { normalizeUsage } from "ai/token/normalizeUsage";
// 示例使用 updateTokensAction 函数时的数据结构

export const updateTokensAction = async (
  { dialogId, usage: usageRaw, cybotConfig },
  thunkApi
) => {
  const { dispatch } = thunkApi;
  const state = thunkApi.getState();
  const auth = state.auth;
  console.log("usageRaw", usageRaw);

  const cybotId = cybotConfig.id;
  const model = cybotConfig.model;
  const provider = cybotConfig.provider;
  // const creatorId = extractUserId(cybotConfig.id);
  // console.log("creatorId", creatorId);

  // const externalPrice = {
  //   input: cybotConfig.inputPrice,
  //   output: cybotConfig.outputPrice,
  //   creatorId,
  // };

  // console.log("externalPrice", externalPrice);

  // const result = calculatePrice({ provider, modelName, usage, externalPrice });
  // console.log("result", result);

  const usage = normalizeUsage(usageRaw);

  const data: TokenUsageData = {
    ...usage,
    userId: auth?.currentUser?.userId,
    cybotId: cybotConfig.id,
    model: cybotConfig.model,
    provider: cybotConfig.provider,
    date: new Date(),
    type: DataType.Token,
    dialogId,
  };

  try {
    // 存储 token 使用记录
    const result = await saveTokenUsage(data);
  } catch (error) {
    console.error("Failed to save token usage:", error);
    throw error;
  }
  return {
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
  };
};
