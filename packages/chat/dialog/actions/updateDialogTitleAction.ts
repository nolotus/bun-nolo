import { runCybotId } from "ai/cybot/cybotSlice";
import { getFilteredMessages } from "chat/messages/utils";
import { patchData, selectById } from "database/dbSlice";
import { format, differenceInHours } from "date-fns";
import { isProduction } from "utils/env";

const TITLE_UPDATE_INTERVAL_HOURS = 6;
// 设置为 true 将跳过时间检查，始终更新标题
const FORCE_UPDATE_FOR_TEST = true;

const shouldUpdateTitle = (lastUpdatedAt: string): boolean => {
  if (FORCE_UPDATE_FOR_TEST) {
    console.log("Force update mode: skipping time check");
    return true;
  }

  const hoursSinceLastUpdate = differenceInHours(
    new Date(),
    new Date(lastUpdatedAt)
  );
  console.log("Hours since last title update:", hoursSinceLastUpdate);

  const shouldUpdate = hoursSinceLastUpdate >= TITLE_UPDATE_INTERVAL_HOURS;
  if (!shouldUpdate) {
    console.log(
      `Title update skipped: last update was ${hoursSinceLastUpdate} hours ago`
    );
  }
  return shouldUpdate;
};

export const updateDialogTitleAction = async (args, thunkApi) => {
  const { dialogKey, cybotConfig } = args;
  const dispatch = thunkApi.dispatch;
  const state = thunkApi.getState();

  const dialogConfig = selectById(state, dialogKey);

  if (!shouldUpdateTitle(dialogConfig.updatedAt)) {
    return dialogConfig;
  }

  const currentMsgs = getFilteredMessages(state);
  const content = JSON.stringify(currentMsgs);

  const cybotId =
    "cybot-UWJFNG1GZUwzLVMzaWhjTzdnWmdrLVJ6d1d6Rm9FTnhYRUNXeFgyc3h6VQ-01JJ20PMEKTBH3CPTQPYD848KA";

  const generateTitle = await dispatch(
    runCybotId({
      cybotId,
      userInput: content,
    })
  ).unwrap();
  console.log("Generated title:", generateTitle);

  const formattedDate = format(new Date(), "MM-dd");
  const title = generateTitle || `${cybotConfig.name}_${formattedDate}`;

  const result = await dispatch(
    patchData({ id: dialogKey, changes: { title } })
  ).unwrap();

  return result;
};
