import { AppThunkApi } from "app/store";
import { SpaceMemberWithSpaceInfo } from "app/types";
import { selectCurrentServer } from "app/settings/settingSlice";
import { selectCurrentToken } from "auth/authSlice";
import { SERVERS } from "database/requests"; // 1. 使用集中的服务器配置

/**
 * 从本地 IndexedDB 获取数据
 * @param userId - 用户ID
 * @param db - IndexedDB 数据库实例
 * @returns 返回一个 Promise，解析为 SpaceMemberWithSpaceInfo 数组
 */
const fetchLocal = async (
  userId: string,
  db: any // 使用 any 类型替代具体的 IndexedDB 类型
): Promise<SpaceMemberWithSpaceInfo[]> => {
  try {
    const memberships: SpaceMemberWithSpaceInfo[] = [];
    const prefix = `space-member-${userId}`;
    for await (const [_, memberData] of db.iterator({
      gte: prefix,
      lte: prefix + "\xff",
    })) {
      // 增加健壮性检查
      if (memberData && typeof memberData === "object" && memberData.spaceId) {
        memberships.push(memberData);
      }
    }
    return memberships;
  } catch (error) {
    console.error("Error fetching local memberships:", error);
    return [];
  }
};

/**
 * 获取用户的所有空间成员资格。
 * 此函数作为 createAsyncThunk 的 payload creator。
 * @param userId - 要获取成员资格的用户ID。
 * @param thunkAPI - Redux Thunk API 对象，包含 getState。
 * @returns 返回一个去重并排序后的 SpaceMemberWithSpaceInfo 数组。
 */
export const fetchUserSpaceMembershipsAction = async (
  userId: string,
  thunkAPI: AppThunkApi
): Promise<SpaceMemberWithSpaceInfo[]> => {
  // --- 主逻辑开始 ---
  const state = thunkAPI.getState();
  const db = thunkAPI.extra.db;
  const token = selectCurrentToken(state);

  // 辅助函数：从远程服务器获取数据
  const fetchRemote = async (
    server: string
  ): Promise<SpaceMemberWithSpaceInfo[]> => {
    if (!token) return [];
    try {
      const response = await fetch(`${server}/rpc/getUserSpaceMemberships`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        console.error(
          `Failed to fetch memberships from ${server}: ${response.statusText}`
        );
        return [];
      }
      // 添加一个简单的验证确保返回的是数组
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      // 捕获网络错误或超时错误，返回空数组，不中断 Promise.all
      console.error(`Error fetching memberships from ${server}:`, error);
      return [];
    }
  };

  // 3. 并行获取本地和远程数据
  const currentServer = selectCurrentServer(state);
  const uniqueServers = Array.from(
    new Set([currentServer, ...Object.values(SERVERS)])
  ).filter(Boolean);

  const [localMemberships, ...remoteResults] = await Promise.all([
    fetchLocal(userId, db),
    ...uniqueServers.map((server) => fetchRemote(server)),
  ]);

  // 4. 合并、去重和排序
  const membershipMap = new Map<string, SpaceMemberWithSpaceInfo>();
  [...localMemberships, ...remoteResults.flat()].forEach((membership) => {
    // 确保有 spaceId 才加入 map
    if (membership?.spaceId) {
      membershipMap.set(membership.spaceId, membership);
    }
  });

  // createAsyncThunk 会自动捕获此处的 Promise.reject，无需顶层 try/catch
  return Array.from(membershipMap.values()).sort(
    (a, b) => (b.joinedAt || 0) - (a.joinedAt || 0)
  );
};
