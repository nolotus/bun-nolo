import { NoloRootState } from "app/store";

export const selectMessage = (state: NoloRootState) => state.message;
