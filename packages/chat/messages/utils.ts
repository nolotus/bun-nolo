import { filter, reverse } from "rambda";
import { selectEntitiesByIds } from "database/dbSlice";
import { NoloRootState } from "app/store";

export const getFilteredMessages = (state: NoloRootState) => {
  const originMessages = selectEntitiesByIds(state, state.message.ids);
  return reverse(filter((x) => x !== null && x !== undefined, originMessages));
};
