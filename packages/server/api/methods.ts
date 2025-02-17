import { fetchPubCybots } from "ai/cybot/server/fetchPubCybots";
import { deletePubCybot } from "ai/cybot/server/deletePubCybot"; // 导入删除函数
import { fetchUserSpaceMemberships } from "create/space/server/fetchUserSpaceMemberships"; // 导入新函数
import { type ApiMethod } from "./types";

// 定义所有API方法
export const apiMethods = {
  // Cybot 相关
  getPubCybots: {
    handler: fetchPubCybots,
    auth: false,
  },

  deletePubCybot: {
    // 更改方法名称以匹配函数
    // 添加删除方法
    handler: deletePubCybot,
    auth: true, // 假设需要权限
  },

  // 用户空间成员相关
  getUserSpaceMemberships: {
    handler: fetchUserSpaceMemberships,
    auth: true, // 假设需要权限
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
