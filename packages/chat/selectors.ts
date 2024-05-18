import { createCachedSelector } from "re-reselect";

import { extractUserId } from "core";
import { selectAllData } from "database/selectors";
import { selectCurrentUserId } from "auth/selectors";
import { DataType } from "create/types";

export const selectCurrentUserChatRobots = createCachedSelector(
  [selectAllData, selectCurrentUserId],
  (allData, userId) =>
    // 使用短路运算符直接确定是否需要进一步筛选
    userId
      ? allData.filter(
          (item) =>
            item.type === DataType.ChatRobot &&
            extractUserId(item.id) === userId,
        )
      : [],
)(
  // 使用函数判断userId是否存在，不存在则返回"empty"进行缓存键区分
  (_state, userId) => userId ?? "empty",
);
export const selectCurrentUserDialog = createCachedSelector(
  [selectAllData, selectCurrentUserId],
  (allData, userId) =>
    // 使用短路运算符直接确定是否需要进一步筛选
    userId
      ? allData.filter(
          (item) =>
            item.type === DataType.Dialog && extractUserId(item.id) === userId,
        )
      : [],
)(
  // 使用函数判断userId是否存在，不存在则返回"empty"进行缓存键区分
  (_state, userId) => userId ?? "empty",
);
