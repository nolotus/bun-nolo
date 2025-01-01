import { DataType } from "create/types";
import { write } from "database/dbSlice";
import { nolotusId } from "core/init";

// 定义 TokenCounts 接口
interface TokenCounts {
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  output_tokens: number;
  input_tokens: number;
}

// 异步 action 更新代币统计信息
export const updateTokensAction = async (
  { cybotId, model, usage },
  thunkApi
) => {
  const { dispatch } = thunkApi;
  const state = thunkApi.getState();
  const auth = state.auth;
  console.log("usage", usage);
  // 准备静态数据
  const staticData = {
    ...usage,
    userId: auth?.currentUser?.userId,
    username: auth?.currentUser?.username,
    cybotId,
    model,
    date: new Date(),
  };

  // 日志输出，调试用
  console.log("staticData", staticData);

  try {
    // 写入数据库
    await dispatch(
      write({
        data: {
          ...staticData,
          type: DataType.TokenStats,
        },
        flags: { isJSON: true },
        userId: nolotusId,
      })
    );
  } catch (error) {
    // 错误处理
    console.error("Error writing token stats:", error);
    throw error; // 可以选择进一步传播错误
  }

  return usage;
};
