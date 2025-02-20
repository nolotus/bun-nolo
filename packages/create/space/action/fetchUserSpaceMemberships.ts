import { browserDb } from "database/browser/db";
import { SpaceMemberWithSpaceInfo } from "create/space/types";
import { selectCurrentServer } from "setting/settingSlice";

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

  try {
    // 查询用户的所有space-member记录
    const memberships = await clientfetchUserSpaceMembers(userId);
    const response = await fetch(
      `${currentServer}/rpc/getUserSpaceMemberships`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
        }),
      }
    );
    console.log("fetchUserSpaceMembershipsAction", await response.json());
    // 按加入时间排序
    console.log("fetchUserSpaceMembershipsAction", memberships);
    const result = memberships.sort((a, b) => b.joinedAt - a.joinedAt);
    return result;
  } catch (error) {
    console.error("Error fetching user space memberships:", error);
    throw error;
  }
};
