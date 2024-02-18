import { createSelector } from "@reduxjs/toolkit";
import { selectAllData } from "database/selectors";
export const selectFilterType = (state) => state.life.filterType;
export const selectUserIdFilter = (state) => state.life.userIdFilter;
export const selectSourceFilter = (state) => state.life.sourceFilter;

export const selectFilteredLifeData = createSelector(
  [
    selectAllData,
    selectFilterType,
    selectUserIdFilter,
    selectSourceFilter,
    (state) => state.life.sortKey,
    (state) => state.life.sortOrder,
  ],
  (data, filterType, userIdFilter, sourceFilter, sortKey, sortOrder) => {
    let filteredData = data;

    if (filterType) {
      filteredData = filteredData.filter((item) => item.type === filterType);
    }

    if (userIdFilter) {
      filteredData = filteredData.filter(
        (item) => item.userId === userIdFilter,
      );
    }
    if (sourceFilter && sourceFilter !== "All") {
      filteredData = filteredData.filter((item) =>
        item.source.includes(sourceFilter),
      );
    }

    // 检查并筛选出具有指定sortKey的数据
    if (sortKey) {
      filteredData = filteredData.filter((item) => item[sortKey] !== undefined);
      // 排序
      filteredData = filteredData.sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (sortOrder === "asc") {
          return aValue < bValue ? -1 : 1;
        } else {
          return aValue > bValue ? -1 : 1;
        }
      });
    }

    return filteredData;
  },
);
