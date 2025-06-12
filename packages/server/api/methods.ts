import { fetchPubCybots } from "ai/cybot/server/fetchPubCybots";
import { fetchUserSpaceMemberships } from "create/space/server/fetchUserSpaceMemberships";
import { fetchConvMsgs } from "chat/messages/server/fetchConvMsgs"; // 调整后的导入路径

// 定义所有API方法
export const apiMethods = {
  // Cybot 相关
  getPubCybots: {
    handler: fetchPubCybots,
    auth: false,
  },

  // 用户空间成员相关
  getUserSpaceMemberships: {
    handler: fetchUserSpaceMemberships,
    auth: true,
  },

  // 获取对话消息
  getConvMsgs: {
    handler: fetchConvMsgs,
    auth: true, // 需要身份验证
  },
} as const;

// 类型辅助
export type ApiMethods = typeof apiMethods;
export type MethodName = keyof ApiMethods;
