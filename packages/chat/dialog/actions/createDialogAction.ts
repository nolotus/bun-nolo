import { selectCurrentUserId } from "auth/authSlice";
import { extractCustomId } from "core/prefix";
import {
  addContentToSpace,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";
import { DataType } from "create/types";
import { read, write } from "database/dbSlice";
import { createDialogKey, createDialogMessageKeyAndId } from "database/keys";
import { format, formatISO } from "date-fns"; // 引入 formatISO
import { DialogInvocationMode } from "chat/dialog/types";

export const createDialogAction = async (args, thunkApi) => {
  const { cybots, category } = args;
  const dispatch = thunkApi.dispatch;
  const cybotId = cybots[0];

  const cybotConfig = await dispatch(read(cybotId)).unwrap();
  const time = format(new Date(), "MM-dd HH:mm");
  const title = cybotConfig.name + "  " + time;
  const userId = selectCurrentUserId(thunkApi.getState());
  const dialogPath = createDialogKey(userId);

  // 设置 createdAt，updatedAt 将由 normalizeTimeFields 处理
  const data = {
    cybots,
    title,
    dbKey: dialogPath,
    type: DataType.DIALOG,
    mode: DialogInvocationMode.FIRST,
    createdAt: formatISO(new Date()), // 使用 date-fns 格式化，与 toISOString() 兼容
    // updatedAt: formatISO(new Date()), // 可选：不设置，让 normalizeTimeFields 处理
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

  const { messageId, key } = createDialogMessageKeyAndId;

  const msgData = {
    id: messageId,
    dbKey: key,
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
