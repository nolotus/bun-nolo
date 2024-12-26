import { runCybotId } from "ai/cybot/cybotSlice";
import { getFilteredMessages } from "chat/messages/utils";
import { patchData } from "database/dbSlice";
import { format } from "date-fns";
import { selectCurrentServer } from "setting/settingSlice";

export const updateDialogTitleAction = async (args, thunkApi) => {
  const { dialogId, cybotConfig } = args; //
  const dispatch = thunkApi.dispatch;
  const state = thunkApi.getState();

  // 在这里获取currentMsgs
  const currentMsgs = getFilteredMessages(state);
  const content = JSON.stringify(currentMsgs);
  const currentServer = selectCurrentServer(state);
  console.log("currentServer", currentServer);

  // 根据服务器地址选择cybotId
  const cybotId = currentServer.includes("localhost")
    ? "000000100000-c1NvY0lIV2tudXVOY0xMY3gxRlVjX29yVUJUU3RsbnEwcmVQMUJSQm9XRQ-01JFHYXE5J7C31WK7X8EDT048Z"
    : "000000100000-UWJFNG1GZUwzLVMzaWhjTzdnWmdrLVJ6d1d6Rm9FTnhYRUNXeFgyc3h6VQ-01JFJ1CRD6MPQ8G8EJFBA0YY8J";

  let title;
  try {
    // 调用runCybotId以获取标题
    title = await dispatch(
      runCybotId({
        cybotId,
        userInput: content,
      }),
    ).unwrap();
  } catch (error) {
    console.error("Failed to get title from cybotId:", error);

    // 失败时使用当前日期生成备用标题
    const formattedDate = format(new Date(), "MM-dd");
    title = `${cybotConfig.name}_${formattedDate}`;
  }

  // 更新数据库中的对话标题
  const result = await dispatch(
    patchData({ id: dialogId, changes: { title } }),
  ).unwrap();

  return result;
};
