import { NoloRootState } from "app/store";

export const selectMessage = (state: NoloRootState) => state.message;
export const selectMessageList = (state: NoloRootState) => {
  const ids = state.message.ids;
  return ids ? ids.slice().reverse() : [];
};
export const selectMessageFailed = (state: NoloRootState) =>
  state.message.messageListFailed;
