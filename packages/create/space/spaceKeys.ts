const SEPARATOR = "-";
const SPACE_PREFIX = "space";

export const createSpaceKey = {
  // 空间基础信息的key
  space: (spaceId: string) => {
    return [SPACE_PREFIX, spaceId].join(SEPARATOR);
  },

  // 空间成员的key
  member: (userId: string, spaceId: string) => {
    return [SPACE_PREFIX, "member", userId, spaceId].join(SEPARATOR);
  },

  // 查询用户所在的所有空间的范围
  memberRange: (userId: string) => {
    return {
      start: [SPACE_PREFIX, "member", userId, ""].join(SEPARATOR),
      end: [SPACE_PREFIX, "member", userId, "\uffff"].join(SEPARATOR),
    };
  },

  // 从成员key中提取空间key
  spaceFromMember: (memberKey: string) => {
    const parts = memberKey.split(SEPARATOR);
    const spaceId = parts[parts.length - 1];
    return [SPACE_PREFIX, spaceId].join(SEPARATOR);
  },

  // 从成员key中提取空间ID
  spaceIdFromMember: (memberKey: string) => {
    const parts = memberKey.split(SEPARATOR);
    return parts[parts.length - 1];
  },
};
