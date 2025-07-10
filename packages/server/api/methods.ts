// ai/server/apiMethods.ts

import serverDb from "database/server/db";
import { pubCybotKeys } from "database/keys";
import { Agent, SpaceMemberWithSpaceInfo } from "app/types";
import { fetchMessages, MessageWithKey } from "chat/messages/fetchMessages";
import type { Message } from "chat/messages/types";

export interface FetchPubCybotsOptions {
  limit?: number;
  sortBy?: "newest" | "popular" | "rating";
}
export interface FetchPubCybotsResult {
  data: Agent[];
  total: number;
  hasMore: boolean;
}

// DB 列表迭代
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

export async function fetchPubCybots(
  options: FetchPubCybotsOptions = {}
): Promise<FetchPubCybotsResult> {
  const { limit = 20, sortBy = "newest" } = options;
  const { start, end } = pubCybotKeys.list();
  const list = await dbList<Agent>(start, end, (v) => v.isPublic);
  list.sort((a, b) => {
    if (sortBy === "popular")
      return (b.metrics?.useCount ?? 0) - (a.metrics?.useCount ?? 0);
    if (sortBy === "rating")
      return (b.metrics?.rating ?? 0) - (a.metrics?.rating ?? 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const data = list.slice(0, limit);
  return { data, total: list.length, hasMore: list.length > limit };
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
  getPubCybots: { handler: fetchPubCybots, auth: false },
  getUserSpaceMemberships: { handler: fetchUserSpaceMemberships, auth: true },
  getConvMsgs: { handler: fetchConvMsgs, auth: true },
} as const;

export type ApiMethods = typeof apiMethods;
export type MethodName = keyof ApiMethods;
