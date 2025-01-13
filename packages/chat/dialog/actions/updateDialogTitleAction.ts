import { runCybotId } from "ai/cybot/cybotSlice";
import { getFilteredMessages } from "chat/messages/utils";
import { patchData } from "database/dbSlice";
import { format } from "date-fns";
import { isProduction } from "utils/env";

export const updateDialogTitleAction = async (args, thunkApi) => {
  const { dialogKey, cybotConfig } = args; //
  const dispatch = thunkApi.dispatch;
  const state = thunkApi.getState();

  // 在这里获取currentMsgs
  const currentMsgs = getFilteredMessages(state);
  const content = JSON.stringify(currentMsgs);

  // 根据服务器地址选择cybotId
  const cybotId = isProduction
    ? "000000100000-UWJFNG1GZUwzLVMzaWhjTzdnWmdrLVJ6d1d6Rm9FTnhYRUNXeFgyc3h6VQ-01JGTFKJ7TRE78ZB1E1ZSJRAFJ"
    : "cybot-UWJFNG1GZUwzLVMzaWhjTzdnWmdrLVJ6d1d6Rm9FTnhYRUNXeFgyc3h6VQ-01JGV8AB85FP1GC3Z42W9ATSPG";

  let title;
  const generateitle = await dispatch(
    runCybotId({
      cybotId,
      userInput: content,
    })
  ).unwrap();
  const formattedDate = format(new Date(), "MM-dd");

  generateitle
    ? (title = generateitle)
    : `${cybotConfig.name}_${formattedDate}`;

  // 更新数据库中的对话标题
  const result = await dispatch(
    patchData({ id: dialogKey, changes: { title } })
  ).unwrap();

  return result;
};
