import { SpaceMemberWithSpaceInfo } from "create/space/types";
import serverDb from "database/server/db";

export const fetchUserSpaceMemberships = async (
  params: string | { userId: string }
) => {
  // 灵活处理参数：如果是字符串直接使用，如果是对象则提取 userId
  const userId = typeof params === "string" ? params : params.userId;

  if (!userId || typeof userId !== "string") {
    throw new Error("userId must be a string");
  }

  const memberships: SpaceMemberWithSpaceInfo[] = [];
  const memberPrefix = `space-member-${userId}-`;

  console.info(
    `Starting query for user ${userId} with prefix: ${memberPrefix}`
  );

  try {
    let count = 0;
    for await (const [key, memberData] of serverDb.iterator({
      gte: memberPrefix,
      lte: memberPrefix + "\xff",
    })) {
      console.debug(`Found record - key: ${key}, data:`, memberData);
      memberships.push(memberData);
      count++;
    }

    if (count === 0) {
      console.warn(
        `No memberships found for user ${userId} with prefix ${memberPrefix}`
      );
    } else {
      console.info(`Found ${count} memberships for user ${userId}`);
    }

    return memberships;
  } catch (error) {
    console.error(`Error querying memberships for user ${userId}:`, error);
    throw error;
  }
};
