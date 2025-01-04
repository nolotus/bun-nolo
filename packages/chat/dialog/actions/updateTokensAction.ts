// 定义 TokenCounts 接口
import { nolotusId } from "core/init";
import { DataType } from "create/types";
import level from "level";
import { calculatePrice } from "integrations/anthropic/calculatePrice";
import { extractUserId } from "core";

console.log("level", level);
interface TokenCounts {
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  output_tokens: number;
  input_tokens: number;
}

// 必须的数据类型
interface RequiredData extends TokenCounts {
  userId: string;
  username: string;
  cybotId: string;
  model: string;
  date: Date;
}

// 额外数据类型
interface AdditionalData {
  deviceType?: string;
  operatingSystem?: string;
  browser?: string;
  language?: string;
  screenResolution?: string;
}

// 合并数据类型
type StaticData = RequiredData & AdditionalData;

// 示例使用 updateTokensAction 函数时的数据结构
export const updateTokensAction = async ({ usage, cybotConfig }, thunkApi) => {
  const { dispatch } = thunkApi;

  const state = thunkApi.getState();
  const auth = state.auth;
  const shareAdditionalData = true;
  const cybotId = cybotConfig.id;
  const modelName = cybotConfig.model;
  const provider = cybotConfig.provider;
  console.log("cybotConfig", cybotConfig);
  const creatorId = extractUserId(cybotConfig.id);
  console.log("creatorId", creatorId);

  const externalPrice = {
    input: cybotConfig.inputPrice,
    output: cybotConfig.outputPrice,
    creatorId,
  };

  console.log("externalPrice", externalPrice);

  const result = calculatePrice({ provider, modelName, usage, externalPrice });
  console.log("result", result);

  return usage;
  const requiredData: RequiredData = {
    ...usage,
    userId: auth?.currentUser?.userId,
    username: auth?.currentUser?.username,
    cybotId,
    model,
    provider,
    date: new Date(),
  };
  const additionalData: AdditionalData = shareAdditionalData
    ? {
        deviceType: navigator.userAgent.includes("Mobile")
          ? "Mobile"
          : "Desktop",
        operatingSystem: navigator.platform || "Unknown",
        browser: (() => {
          if (navigator.userAgent.includes("Chrome")) return "Chrome";
          if (navigator.userAgent.includes("Firefox")) return "Firefox";
          if (navigator.userAgent.includes("Safari")) return "Safari";
          return "Unknown";
        })(),
        language: navigator.language || "en-US",
        screenResolution: `${window.screen.width}x${window.screen.height}`,
      }
    : {};

  const staticData: StaticData = {
    ...requiredData,
    ...additionalData,
  };

  console.log("staticData", staticData);
  const saveData = {
    ...staticData,
    type: DataType.TokenStats,
  };
};
