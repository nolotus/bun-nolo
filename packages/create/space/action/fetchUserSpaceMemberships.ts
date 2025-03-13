import { browserDb } from "database/browser/db";
import { SpaceMemberWithSpaceInfo } from "create/space/types";
import { selectCurrentServer } from "setting/settingSlice";
import { selectCurrentToken } from "auth/authSlice";

// 配置常量
const SERVER_TIMEOUT = 5000; // 5秒超时
const SERVERS = ["https://cybot.one", "https://cybot.run"];

/**
 * 从本地数据库获取用户空间成员数据
 * @param {string} userId 用户ID
 * @returns {Promise<SpaceMemberWithSpaceInfo[]>} 本地成员数据
 */
const fetchLocalSpaceMembers = async (userId) => {
  try {
    console.debug(`Fetching local space members for user ${userId}`);
    const memberships: SpaceMemberWithSpaceInfo[] = [];
    const memberPrefix = `space-member-${userId}`;

    for await (const [key, memberData] of browserDb.iterator({
      gte: memberPrefix,
      lte: memberPrefix + "\xff",
    })) {
      memberships.push(memberData);
    }

    console.debug(`Found ${memberships.length} local memberships`);
    return memberships;
  } catch (error) {
    console.error(
      `Failed to fetch local space members for user ${userId}:`,
      error
    );
    return []; // 返回空数组而不是抛出错误
  }
};

/**
 * 使用超时机制的fetch请求
 * @param {string} url 请求地址
 * @param {RequestInit} options 请求选项
 * @param {number} timeout 超时时间（毫秒）
 * @returns {Promise<Response>} fetch响应
 */
const fetchWithTimeout = async (url, options, timeout = SERVER_TIMEOUT) => {
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

/**
 * 从远程服务器获取用户空间成员数据
 * @param {string} server 服务器地址
 * @param {string} userId 用户ID
 * @param {string} token 认证令牌
 * @returns {Promise<SpaceMemberWithSpaceInfo[]>} 远程成员数据
 */
const fetchRemoteSpaceMembers = async (server, userId, token) => {
  try {
    console.debug(`Fetching from ${server} for user ${userId}`);
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

    const data = await response.json();
    console.debug(`Received ${data.length} memberships from ${server}`);
    return data;
  } catch (error) {
    console.warn(`Failed to fetch from ${server}:`, error);
    return [];
  }
};

/**
 * 获取并合并用户的所有空间成员身份
 * @param {string} userId 用户ID
 * @param {any} thunkAPI Redux thunk API
 * @returns {Promise<SpaceMemberWithSpaceInfo[]>} 合并后的成员数据
 */
export const fetchUserSpaceMembershipsAction = async (userId, thunkAPI) => {
  console.info(`Starting fetchUserSpaceMembershipsAction for user ${userId}`);
  const state = thunkAPI.getState();
  const currentServer = selectCurrentServer(state);
  const token = selectCurrentToken(state);

  try {
    // 获取本地数据
    const localMemberships = await fetchLocalSpaceMembers(userId);

    // 准备所有服务器列表
    const allServers = [currentServer, ...SERVERS];

    // 并行获取远程数据
    const remoteFetchPromises = allServers.map((server) =>
      fetchRemoteSpaceMembers(server, userId, token)
    );

    const remoteResults = await Promise.all(remoteFetchPromises);

    // 合并所有数据
    const membershipMap = new Map<string, SpaceMemberWithSpaceInfo>();

    // 添加本地数据
    localMemberships.forEach((membership) => {
      membershipMap.set(membership.spaceId, membership);
    });

    // 添加远程数据
    remoteResults.flat().forEach((membership) => {
      membershipMap.set(membership.spaceId, membership);
    });

    const mergedMemberships = Array.from(membershipMap.values());
    const sortedMemberships = mergedMemberships.sort(
      (a, b) => b.joinedAt - a.joinedAt
    );

    console.info(
      `Successfully fetched ${sortedMemberships.length} total memberships for user ${userId}`
    );
    return sortedMemberships;
  } catch (error) {
    console.error(
      `Fatal error in fetchUserSpaceMembershipsAction for user ${userId}:`,
      error
    );
    throw error;
  }
};
