import { createCachedSelector } from "re-reselect";
import { extractUserId } from "core";

export const selectFilterType = (state) => state.life.filterType;

import { selectAll } from "./dbSlice";

export const selectFilteredDataByUserAndTypeAndWorkspace = (
  userId: string,
  type: string,
  workspaceId?: string
) => {
  return createCachedSelector([selectAll], (allData) =>
    allData.filter(
      (item) =>
        (type === null || item.type === type) &&
        extractUserId(item.id) === userId &&
        (workspaceId === null || workspaceId === undefined
          ? item.workspaceId === null ||
            item.workspaceId === undefined ||
            !item.workspaceId
          : item.workspaceId === workspaceId)
    )
  )(
    // 生成唯一的缓存键，基于userId、type和workspaceId（如果提供）
    () => `${userId}-${type}-${workspaceId || ""}`
  );
};
