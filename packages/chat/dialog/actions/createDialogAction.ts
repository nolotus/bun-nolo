import { selectCurrentUserId } from "auth/authSlice";
import { format } from "date-fns";
import { write, read } from "database/dbSlice";
import { DataType } from "create/types";
import { selectCurrentWorkSpaceId } from "create/workspace/workspaceSlice";

export const createDialogAction = async (args, thunkApi) => {
  const { cybots, category } = args;
  const dispatch = thunkApi.dispatch;
  const state = thunkApi.getState();
  const currentUserId = selectCurrentUserId(state);
  const workspaceId = selectCurrentWorkSpaceId(state);
  const cybotId = cybots[0];
  const messageListConfig = {
    data: [],
    flags: { isList: true },
    userId: currentUserId,
  };
  const writeMessageAction = await dispatch(write(messageListConfig));

  const initMessageList = writeMessageAction.payload;
  const cybotConfig = await dispatch(read({ id: cybotId })).unwrap();
  const time = format(new Date(), "MM-dd HH:mm");
  const title = cybotConfig.name + "  " + time;
  let data;
  data = {
    type: DataType.Dialog,
    cybots,
    category,
    messageListId: initMessageList.id,
    title,
  };
  if (workspaceId) {
    data.workspace = workspaceId;
  }
  const dialogConfig = {
    data,
    flags: { isJSON: true },
    userId: currentUserId,
  };
  const result = await dispatch(write(dialogConfig)).unwrap();

  return result;
};