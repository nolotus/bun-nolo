// ai/server/apiMethods.ts

import serverDb from "database/server/db";
import { SpaceMemberWithSpaceInfo } from "app/types";
import { fetchMessages, MessageWithKey } from "chat/messages/fetchMessages";
import type { Message } from "chat/messages/types";
import { fetchPublicAgents } from "ai/agent/server/fetchPublicAgents"; // <--- 1. 导入新的函数

// DB 列表迭代 (保留，因为 fetchUserSpaceMemberships 仍在使用)
async function dbList<T>(
  gte: string,
  lte: string,
  filter?: (v: T) => boolean
): Promise<T[]> {
  const res: T[] = [];
  for await (const [, value] of serverDb.iterator({ gte, lte })) {
    if (!filter || filter(value as T)) res.push(value as T);
  }
  return res;
}

export async function fetchUserSpaceMemberships(
  params: string | { userId: string }
): Promise<SpaceMemberWithSpaceInfo[]> {
  const userId = typeof params === "string" ? params : params.userId;
  if (!userId) throw new Error("userId 必传");
  const prefix = `space-member-${userId}-`;
  return dbList<SpaceMemberWithSpaceInfo>(prefix, prefix + "\xff");
}

interface FetchConvMsgsParams {
  dialogId: string;
  limit?: number;
  beforeKey?: string | null;
}

export async function fetchConvMsgs(
  params: string | FetchConvMsgsParams
): Promise<Message[]> {
  let dialogId: string,
    limit: number | undefined,
    beforeKey: string | null | undefined;
  if (typeof params === "string") {
    dialogId = params;
    limit = undefined;
    beforeKey = null;
  } else {
    dialogId = params.dialogId;
    limit = params.limit;
    beforeKey = params.beforeKey;
  }
  if (!dialogId) throw new Error("dialogId 必传");
  const msgs: MessageWithKey[] = await fetchMessages(serverDb, dialogId, {
    limit,
    beforeKey,
    throwOnError: true,
  });
  return msgs.map(({ _key, ...m }) => m);
}

export const apiMethods = {
  // 2. 将 getPubCybots 替换为 getPublicAgents
  getPublicAgents: { handler: fetchPublicAgents, auth: false },
  getUserSpaceMemberships: { handler: fetchUserSpaceMemberships, auth: true },
  getConvMsgs: { handler: fetchConvMsgs, auth: true },
} as const;

export type ApiMethods = typeof apiMethods;
export type MethodName = keyof ApiMethods;
