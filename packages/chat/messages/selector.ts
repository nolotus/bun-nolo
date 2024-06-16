import { NoloRootState } from "app/store";

export const selectMessage = (state: NoloRootState) => state.message;
export const selectMessageList = (state: NoloRootState) => state.message.ids;
export const selectMessageFailed = (state: NoloRootState) =>
  state.message.messageListFailed;
