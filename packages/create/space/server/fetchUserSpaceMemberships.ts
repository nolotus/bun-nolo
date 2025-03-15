import { SpaceMemberWithSpaceInfo } from "create/space/types";
import serverDb from "database/server/db";

export const fetchUserSpaceMemberships = async (
  params: string | { userId: string }
) => {
  const userId = typeof params === "string" ? params : params.userId;

  if (!userId || typeof userId !== "string") {
    throw new Error("userId must be a string");
  }

  const memberships: SpaceMemberWithSpaceInfo[] = [];
  const memberPrefix = `space-member-${userId}-`;

  try {
    for await (const [key, memberData] of serverDb.iterator({
      gte: memberPrefix,
      lte: memberPrefix + "\xff",
    })) {
      memberships.push(memberData);
    }

    return memberships;
  } catch (error) {
    throw error;
  }
};
