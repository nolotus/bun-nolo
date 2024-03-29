import { createSelector } from "@reduxjs/toolkit";

export const selectFilterType = (state) => state.life.filterType;

import { dbAdapter } from "./dbSlice";
export const selectAllData = dbAdapter.getSelectors(
  (state) => state.db,
).selectAll;

// 使用 createSelector 来创建一个基于 selectAllData 的 memoized selector
export const selectPages = createSelector([selectAllData], (allData) =>
  allData
    .filter((item) => item.type === "page")
    .sort((a, b) => {
      // 若 a 有 create_at 且 b 无，则 a 排在前面
      if (a.create_at && !b.create_at) {
        return -1;
      }
      // 若 b 有 create_at 且 a 无，则 b 排在前面
      if (b.create_at && !a.create_at) {
        return 1;
      }
      // 若两者都有 create_at，则按 create_at 降序排序
      if (a.create_at && b.create_at) {
        return Date.parse(b.create_at) - Date.parse(a.create_at);
      }
      // 若两者都没有 create_at，则位置保持不变
      return 0;
    }),
);
