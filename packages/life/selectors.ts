import { createSelector } from '@reduxjs/toolkit';
import { selectAllData } from 'database/selectors';
export const selectFilterType = (state) => state.life.filterType;

export const selectFilteredLifeData = createSelector(
  [selectAllData, selectFilterType],
  (data, filterType) => {
    let filteredData = data;

    if (filterType) {
      filteredData = filteredData.filter(
        (item) => item.value.type === filterType, // 直接使用 filterType 而不是 DataType[filterType as keyof typeof DataType]
      );
    }
    return filteredData;
  },
);
