import { selectCurrentUserId } from "auth/authSlice";
import { extractCustomId } from "core/prefix";
import {
  addContentToSpace,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";
import { DataType } from "create/types";
import { read, write } from "database/dbSlice";
import { createDialogKey, createDialogMessageKey } from "database/keys";
import { format } from "date-fns";

export const createDialogAction = async (args, thunkApi) => {
  const { cybots, category } = args;
  const dispatch = thunkApi.dispatch;
  const cybotId = cybots[0];

  const cybotConfig = await dispatch(read(cybotId)).unwrap();
  const time = format(new Date(), "MM-dd HH:mm");
  const title = cybotConfig.name + "  " + time;
  const userId = selectCurrentUserId(thunkApi.getState());
  const dialogPath = createDialogKey(userId);

  const data = {
    cybots,
    category,
    title,
    id: dialogPath,
    type: DataType.DIALOG,
  };

  const result = await dispatch(
    write({ data, customKey: dialogPath })
  ).unwrap();
  const spaceId = selectCurrentSpaceId(thunkApi.getState());

  await dispatch(
    addContentToSpace({
      spaceId,
      contentKey: dialogPath,
      type: DataType.DIALOG,
      title,
    })
  );
  const dialogId = extractCustomId(dialogPath);

  const msgPath = createDialogMessageKey(dialogId);

  const msgData = {
    id: msgPath,
    content: cybotConfig.greeting,
    role: "assistant",
    cybotId,
    type: DataType.MSG,
  };

  const msgResult = await dispatch(
    write({ data: msgData, customKey: msgPath })
  ).unwrap();
  return result;
};
