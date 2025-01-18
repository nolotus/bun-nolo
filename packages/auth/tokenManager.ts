// auth/tokenManager.ts
import { webTokenManager } from "./web/tokenManager";
import type { TokenManager } from "./types";

// 使用 process.env.PLATFORM 在构建时确定平台
const PLATFORM = process.env.PLATFORM || "web";

export const tokenManager: TokenManager =
  PLATFORM === "web" ? webTokenManager : (null as never); // 在web构建时这个分支会被完全删除

export const getTokenManager = async (): Promise<TokenManager> => {
  if (PLATFORM === "web") {
    return webTokenManager;
  }
  const { rnTokenManager } = await import("./rn/tokenManager");
  return rnTokenManager;
};
