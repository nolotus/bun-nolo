import { browserDb } from "database/browser/db";
import { SpaceMemberWithSpaceInfo } from "create/space/types";
import { selectCurrentServer } from "setting/settingSlice";
import { selectCurrentToken } from "auth/authSlice";

// 配置常量
const SERVER_TIMEOUT = 5000;
const SERVERS = ["https://cybot.one", "https://cybot.run"];

const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout = SERVER_TIMEOUT
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const fetchLocalSpaceMembers = async (userId: string) => {
  try {
    const memberships: SpaceMemberWithSpaceInfo[] = [];
    const memberPrefix = `space-member-${userId}`;
    for await (const [_, memberData] of browserDb.iterator({
      gte: memberPrefix,
      lte: memberPrefix + "\xff",
    })) {
      memberships.push(memberData);
    }
    return memberships;
  } catch (error) {
    return [];
  }
};

const fetchRemoteSpaceMembers = async (
  server: string,
  userId: string,
  token: string
) => {
  try {
    const response = await fetchWithTimeout(
      `${server}/rpc/getUserSpaceMemberships`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      }
    );
    return (await response.json()) || [];
  } catch (error) {
    return [];
  }
};

export const fetchUserSpaceMembershipsAction = async (
  userId: string,
  thunkAPI: any
) => {
  const state = thunkAPI.getState();
  const currentServer = selectCurrentServer(state);
  const token = selectCurrentToken(state);

  try {
    const localMemberships = await fetchLocalSpaceMembers(userId);
    const allServers = [currentServer, ...SERVERS].filter(Boolean);
    const remoteResults = await Promise.all(
      allServers.map((server) => fetchRemoteSpaceMembers(server, userId, token))
    );

    const membershipMap = new Map<string, SpaceMemberWithSpaceInfo>();
    [...localMemberships, ...remoteResults.flat()].forEach((membership) =>
      membershipMap.set(membership.spaceId, membership)
    );

    return Array.from(membershipMap.values()).sort(
      (a, b) => b.joinedAt - a.joinedAt
    );
  } catch (error) {
    console.error(
      `Fatal error in fetchUserSpaceMembershipsAction for user ${userId}:`,
      error
    );
    throw error;
  }
};
