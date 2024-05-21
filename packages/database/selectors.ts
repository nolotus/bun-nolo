import { createCachedSelector } from "re-reselect";
import { extractUserId } from "core";

export const selectFilterType = (state) => state.life.filterType;

import { selectAll } from "./dbSlice";

export const selectFilteredDataByUserAndType = (userId, type) =>
  createCachedSelector([selectAll], (allData) =>
    allData.filter(
      (item) =>
        (type === null || item.type === type) &&
        extractUserId(item.id) === userId,
    ),
  )(
    // 生成唯一的缓存键，基于userId和type
    () => `${userId}-${type}`,
  );
