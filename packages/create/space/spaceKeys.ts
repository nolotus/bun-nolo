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

  /**
   * 新增：用户在空间中的个性化设置key
   * @param userId 用户ID
   * @param spaceId 空间ID
   * @returns "space-setting-{userId}-{spaceId}"
   */
  setting: (userId: string, spaceId: string) => {
    return [SPACE_PREFIX, "setting", userId, spaceId].join(SEPARATOR);
  },

  /**
   * 新增：查询用户在所有空间中的个性化设置的范围
   * @param userId 用户ID
   * @returns start/end 查询范围
   */
  settingRange: (userId: string) => {
    return {
      start: [SPACE_PREFIX, "setting", userId, ""].join(SEPARATOR),
      end: [SPACE_PREFIX, "setting", userId, "\uffff"].join(SEPARATOR),
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
