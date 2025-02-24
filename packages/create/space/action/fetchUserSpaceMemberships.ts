import { browserDb } from "database/browser/db";
import { SpaceMemberWithSpaceInfo } from "create/space/types";
import { selectCurrentServer } from "setting/settingSlice";
import { selectCurrentToken } from "auth/authSlice";

const clientfetchUserSpaceMembers = async (userId) => {
  const memberships: SpaceMemberWithSpaceInfo[] = [];
  const memberPrefix = `space-member-${userId}`;
  for await (const [key, memberData] of browserDb.iterator({
    gte: memberPrefix,
    lte: memberPrefix + "\xff",
  })) {
    const membership = memberData;
    memberships.push(membership);
  }
  return memberships;
};

export const fetchUserSpaceMembershipsAction = async (userId, thunkAPI) => {
  const dispatch = thunkAPI.dispatch;
  const state = thunkAPI.getState();
  const currentServer = selectCurrentServer(state);
  const token = selectCurrentToken(state);
  try {
    // 查询用户的所有space-member记录
    const localMemberships = await clientfetchUserSpaceMembers(userId);

    const response = await fetch(
      `${currentServer}/rpc/getUserSpaceMemberships`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
        }),
      }
    );
    const remoteMemberships = await response.json();

    // 合并并去重
    const membershipMap = new Map();

    localMemberships.forEach((membership) => {
      membershipMap.set(membership.spaceId, membership);
    });

    remoteMemberships.forEach((membership) => {
      membershipMap.set(membership.spaceId, membership);
    });

    const mergedMemberships = Array.from(membershipMap.values());

    const result = mergedMemberships.sort((a, b) => b.joinedAt - a.joinedAt);
    return result;
  } catch (error) {
    console.error("Error fetching user space memberships:", error);
    throw error;
  }
};
