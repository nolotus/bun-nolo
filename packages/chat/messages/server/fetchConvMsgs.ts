// chat/messages/server/fetchConvMsgs.ts

import serverDb from "database/server/db";
import { fetchMessages } from "../fetchMessages";

export const fetchConvMsgs = async (
  params: string | { dialogId: string; limit?: number }
) => {
  const dialogId = typeof params === "string" ? params : params.dialogId;
  const limit =
    typeof params === "object" && params.limit ? params.limit : 1000;
  return fetchMessages(serverDb, dialogId, limit, true);
};
