import { runCybotId } from "ai/cybot/cybotSlice";
import { getFilteredMessages } from "chat/messages/utils";
import { patchData, selectById } from "database/dbSlice";
import { format, differenceInHours } from "date-fns";
import { isProduction } from "utils/env";

export const updateDialogTitleAction = async (args, thunkApi) => {
  const { dialogKey, cybotConfig } = args;
  const dispatch = thunkApi.dispatch;
  const state = thunkApi.getState();

  const dialogConfig = selectById(state, dialogKey);
  const lastUpdatedAt = dialogConfig.updatedAt;

  // 检查距离上次更新是否超过6小时
  const hoursSinceLastUpdate = differenceInHours(
    new Date(),
    new Date(lastUpdatedAt)
  );
  console.log("hoursSinceLastUpdate", hoursSinceLastUpdate);
  if (hoursSinceLastUpdate < 6) {
    console.log(
      `Title update skipped: last update was ${hoursSinceLastUpdate} hours ago`
    );
    return dialogConfig;
  }

  const currentMsgs = getFilteredMessages(state);
  const content = JSON.stringify(currentMsgs);

  const cybotId = isProduction
    ? "000000100000-UWJFNG1GZUwzLVMzaWhjTzdnWmdrLVJ6d1d6Rm9FTnhYRUNXeFgyc3h6VQ-01JGTFKJ7TRE78ZB1E1ZSJRAFJ"
    : "cybot-UWJFNG1GZUwzLVMzaWhjTzdnWmdrLVJ6d1d6Rm9FTnhYRUNXeFgyc3h6VQ-01JGV8AB85FP1GC3Z42W9ATSPG";

  let title;
  const generateTitle = await dispatch(
    runCybotId({
      cybotId,
      userInput: content,
    })
  ).unwrap();

  const formattedDate = format(new Date(), "MM-dd");
  title = generateTitle || `${cybotConfig.name}_${formattedDate}`;

  const result = await dispatch(
    patchData({ id: dialogKey, changes: { title } })
  ).unwrap();

  return result;
};
