import { selectUserId } from "auth/authSlice";
import { extractCustomId } from "core/prefix";
import {
  addContentToSpace,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";
import { DataType } from "create/types";
import { read, write } from "database/dbSlice";
import { createDialogKey } from "database/keys";
import { format, formatISO } from "date-fns";
// 新增导入
import { prepareAndPersistMessage } from "chat/messages/messageSlice";

export const createDialogAction = async (args, thunkApi) => {
  const { cybots, category } = args;
  const { dispatch, getState } = thunkApi;
  const cybotId = cybots[0];

  // 1. 获取 bot 配置
  const botConfig = await dispatch(read(cybotId)).unwrap();
  if (!botConfig) {
    throw new Error(`Cybot with id ${cybotId} not found.`);
  }

  const time = format(new Date(), "MM-dd HH:mm");
  const title = botConfig.name + "  " + time;
  const userId = selectUserId(getState());
  const dialogPath = createDialogKey(userId);
  const dialogId = extractCustomId(dialogPath);

  // 2. 准备并写入对话数据
  const dialogData = {
    id: dialogId,
    dbKey: dialogPath,
    cybots,
    title,
    type: DataType.DIALOG,
    createdAt: formatISO(new Date()),
    category,
  };
  const result = await dispatch(
    write({ data: dialogData, customKey: dialogPath })
  ).unwrap();

  // 3. 将对话添加到空间
  const spaceId = selectCurrentSpaceId(getState());
  await dispatch(
    addContentToSpace({
      spaceId,
      contentKey: dialogPath,
      type: DataType.DIALOG,
      title,
    })
  );

  // 4. **[REFACTORED]** 条件性地创建初始消息
  // 使用新的 prepareAndPersistMessage thunk，它会同时更新UI状态和数据库
  if (botConfig.greeting) {
    await dispatch(
      prepareAndPersistMessage({
        message: {
          content: botConfig.greeting,
          role: "assistant",
          cybotKey: cybotId,
        },
        dialogConfig: {
          id: dialogId,
          dbKey: dialogPath,
        },
      })
    );
  }

  // 5. 返回对话创建结果
  return result;
};
