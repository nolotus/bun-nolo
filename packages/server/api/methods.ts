// server/api/methods.ts
import { fetchPubCybots } from "ai/cybot/server/fetchPubCybots";
import { type ApiMethod } from "./types";

// 定义所有API方法
export const apiMethods = {
  // Cybot 相关
  getPubCybots: {
    handler: fetchPubCybots,
    auth: false,
  },

  // 可以继续添加更多方法...
  // updateProfile: {
  //   handler: updateProfile,
  //   auth: true
  // }
} as const;

// 类型辅助
export type ApiMethods = typeof apiMethods;
export type MethodName = keyof ApiMethods;
