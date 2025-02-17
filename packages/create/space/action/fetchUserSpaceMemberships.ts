import { browserDb } from "database/browser/db";
import { SpaceMemberWithSpaceInfo } from "create/space/types";

const clientfetchUserSpaceMembers = async (userId) => {
  const memberships: SpaceMemberWithSpaceInfo[] = [];
  const memberPrefix = `space-member-${userId}-`;
  for await (const [key, memberData] of browserDb.iterator({
    gte: memberPrefix,
    lte: memberPrefix + "\xff",
  })) {
    const membership = memberData;

    memberships.push(membership);
  }
  return memberships;
};

export const fetchUserSpaceMembershipsAction = () => {
  async (userId, thunkAPI) => {
    const dispatch = thunkAPI.dispatch;
    const state = thunkAPI.getState();

    try {
      // 查询用户的所有space-member记录
      const memberships = clientfetchUserSpaceMembers(userId);
      // 按加入时间排序
      const result = memberships.sort((a, b) => b.joinedAt - a.joinedAt);
      return result;
    } catch (error) {
      console.error("Error fetching user space memberships:", error);
      throw error;
    }
  };
};
