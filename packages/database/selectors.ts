export const selectFilterType = (state) => state.life.filterType;

import { dbAdapter } from './dbSlice';
export const selectAllData = dbAdapter.getSelectors(
  (state) => state.db,
).selectAll;
