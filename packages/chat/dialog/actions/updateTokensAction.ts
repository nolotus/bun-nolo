// 定义 TokenCounts 接口
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
export const updateTokensAction = async (
  {
    cybotId,
    model,
    usage,
  }: { cybotId: string; model: string; usage: TokenCounts },
  thunkApi,
  shareAdditionalData = true
) => {
  const { dispatch } = thunkApi;
  const state = thunkApi.getState();
  const auth = state.auth;

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

  const requiredData: RequiredData = {
    ...usage,
    userId: auth?.currentUser?.userId,
    username: auth?.currentUser?.username,
    cybotId,
    model,
    date: new Date(),
  };

  const staticData: StaticData = {
    ...requiredData,
    ...additionalData,
  };

  console.log("staticData", staticData);

  try {
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
    console.error("Error writing token stats:", error);
    throw error;
  }

  return usage;
};
