import { selectCurrentUserId } from "auth/authSlice";
import { format } from "date-fns";
import { write, read } from "database/dbSlice";
import { DataType } from "create/types";

export const createDialogAction = async (args, thunkApi) => {
  const { cybots, category } = args;
  const dispatch = thunkApi.dispatch;
  const state = thunkApi.getState();
  const currentUserId = selectCurrentUserId(state);
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

  const dialogConfig = {
    data: {
      type: DataType.Dialog,
      cybots,
      category,
      messageListId: initMessageList.id,
      title,
    },
    flags: { isJSON: true },
    userId: currentUserId,
  };
  const result = await dispatch(write(dialogConfig)).unwrap();
  return result;
};
