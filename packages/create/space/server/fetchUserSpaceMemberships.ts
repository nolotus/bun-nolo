import { SpaceMemberWithSpaceInfo } from "create/space/types";
import serverDb from "database/server/db";

export const fetchUserSpaceMemberships = async (userId) => {
  const memberships: SpaceMemberWithSpaceInfo[] = [];
  const memberPrefix = `space-member-${userId}-`;
  for await (const [key, memberData] of serverDb.iterator({
    gte: memberPrefix,
    lte: memberPrefix + "\xff",
  })) {
    const membership = memberData;

    memberships.push(membership);
  }
  return memberships;
};
