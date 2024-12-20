import type { NoloRootState } from "app/store";
import { selectEntitiesByIds } from "database/dbSlice";
import { filter, reverse } from "rambda";

export const getFilteredMessages = (state: NoloRootState) => {
	const originMessages = selectEntitiesByIds(state, state.message.ids);
	return reverse(filter((x) => x !== null && x !== undefined, originMessages));
};
