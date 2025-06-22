import { selectCurrentUserId } from "auth/authSlice";
import { extractCustomId } from "core/prefix";
import {
  addContentToSpace,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";
import { DataType } from "create/types";
import { read, write } from "database/dbSlice";
import { createDialogKey, createDialogMessageKeyAndId } from "database/keys";
import { format, formatISO } from "date-fns";
import { DialogInvocationMode } from "app/types";

export const createDialogAction = async (args, thunkApi) => {
  const { cybots, category } = args;
  const dispatch = thunkApi.dispatch;
  const cybotId = cybots[0];

  // 1. 获取 bot 配置
  const botConfig = await dispatch(read(cybotId)).unwrap();
  const time = format(new Date(), "MM-dd HH:mm");
  const title = botConfig.name + "  " + time;
  const userId = selectCurrentUserId(thunkApi.getState());
  const dialogPath = createDialogKey(userId);
  const dialogId = extractCustomId(dialogPath);

  // 2. 准备并写入对话数据
  const data = {
    id: dialogId,
    cybots,
    title,
    dbKey: dialogPath,
    type: DataType.DIALOG,
    mode: DialogInvocationMode.FIRST,
    createdAt: formatISO(new Date()), // 使用 date-fns 格式化
    // updatedAt: formatISO(new Date()), // 由 normalizeTimeFields 处理
  };
  const result = await dispatch(
    write({ data, customKey: dialogPath })
  ).unwrap();

  // 3. 将对话添加到空间
  const spaceId = selectCurrentSpaceId(thunkApi.getState());
  await dispatch(
    addContentToSpace({
      spaceId,
      contentKey: dialogPath,
      type: DataType.DIALOG,
      title,
    })
  );

  // 4. **条件性地创建初始消息**
  // 检查 cybotConfig.greeting 是否存在且不为空
  if (botConfig.greeting) {
    const { messageId, key } = createDialogMessageKeyAndId(dialogId);
    const msgData = {
      id: messageId,
      dbKey: key,
      content: botConfig.greeting, // 使用非空的 greeting
      role: "assistant",
      cybotKey: cybotId,
      type: DataType.MSG,
      // 初始消息通常也需要时间戳，根据你的 normalizeTimeFields 逻辑决定是否在此处添加
      // createdAt: formatISO(new Date()),
    };
    // 只有在 greeting 有值时才写入消息
    const msgResult = await dispatch(
      write({ data: msgData, customKey: key })
    ).unwrap();
    // 注意：原始代码 msgResult 未被使用，这里保留了写入操作，但结果同样未使用
  } else {
    // 如果 greeting 为空，则不执行任何操作，跳过创建初始消息
    console.log(
      `Cybot ${cybotId} greeting is empty, skipping initial message creation.`
    ); // 可选日志
  }

  // 5. 返回对话创建结果
  return result;
};
