import { nolotusId } from "core/init";
import { DataType } from "create/types";
import { calculatePrice } from "integrations/anthropic/calculatePrice";
import { extractUserId } from "core/prefix";

import { saveTokenUsage } from "ai/token/db";

// 示例使用 updateTokensAction 函数时的数据结构
export const updateTokensAction = async ({ usage, cybotConfig }, thunkApi) => {
  const { dispatch } = thunkApi;
  const state = thunkApi.getState();
  const auth = state.auth;

  const shareAdditionalData = true;
  const cybotId = cybotConfig.id;
  const modelName = cybotConfig.model;
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
  console.log("usage", usage);
  const normalizedUsage = {
    input_tokens: usage.prompt_tokens,
    output_tokens: usage.completion_tokens,
    cache_creation_input_tokens: usage.prompt_cache_miss_tokens || 0,
    cache_read_input_tokens: usage.prompt_cache_hit_tokens || 0,
    // 计算 cost 的逻辑可以在这里添加
    cost: 0, // TODO: 添加成本计算
  };

  const data = {
    ...normalizedUsage, // 使用转换后的 usage
    userId: auth?.currentUser?.userId,
    username: auth?.currentUser?.username,
    cybotId,
    modelName,
    provider,
    date: new Date(),
    type: DataType.Token,
  };

  try {
    // 存储 token 使用记录
    const result = await saveTokenUsage(data);
    return result;
  } catch (error) {
    console.error("Failed to save token usage:", error);
    throw error;
  }

  return usage;
};
