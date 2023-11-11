import { createSelector } from '@reduxjs/toolkit';
import { selectAllData } from 'database/selectors';
export const selectFilterType = (state) => state.life.filterType;
export const selectUserIdFilter = (state) => state.life.userIdFilter;

export const selectFilteredLifeData = createSelector(
  [selectAllData, selectFilterType, selectUserIdFilter],
  (data, filterType, userIdFilter) => {
    let filteredData = data;

    if (filterType) {
      filteredData = filteredData.filter(
        (item) => item.value.type === filterType,
      );
    }

    if (userIdFilter) {
      filteredData = filteredData.filter(
        (item) => item.value.userId === userIdFilter,
      );
    }

    return filteredData;
  },
);
