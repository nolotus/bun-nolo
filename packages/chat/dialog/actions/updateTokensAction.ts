// 定义 TokenCounts 接口
import { nolotusId } from "core/init";
import { DataType } from "create/types";
import level from "level";
import { calculatePrice } from "integrations/anthropic/calculatePrice";
import { extractUserId } from "core";
import { write } from "database/dbSlice";

console.log("level", level);
interface TokenCounts {
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  output_tokens: number;
  input_tokens: number;
}

// 必须的数据类型
interface RequiredData extends TokenCounts {
  dialogId: string;
  userId: string;
  username: string;
  cybotId: string;
  model: string;
  date: Date;
  provider: string;
}

// 额外数据类型

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

  const data: RequiredData = {
    ...usage,
    userId: auth?.currentUser?.userId,
    username: auth?.currentUser?.username,
    cybotId,
    modelName,
    provider,
    date: new Date(),
    type: DataType.Token,
  };
  console.log("data", data);
  const userId = auth.user.userId;

  // dispatch(
  //   write({
  //     data: {
  //       type: DataType.Token,
  //       ...data,
  //     },
  //     userId: auth.user?.userId,
  //   })
  // );

  return usage;
};
