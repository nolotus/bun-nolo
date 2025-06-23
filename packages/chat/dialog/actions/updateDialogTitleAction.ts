import { runAgent } from "ai/cybot/cybotSlice";
import { titleCybotId } from "core/init";
import {
  selectCurrentSpaceId,
  updateContentTitle,
} from "create/space/spaceSlice";
import { patch, selectById } from "database/dbSlice";
import { format, differenceInHours } from "date-fns";

import { RootState } from "app/store";
import { pipe, flatten, filter, reverse } from "rambda";

import { selectAllMsgs } from "../../messages/messageSlice";

const getFilteredMessages = (state: RootState) => {
  const msgs = selectAllMsgs(state);

  return pipe(
    flatten,
    // 过滤掉 null/undefined 和 content 为空的消息
    filter((msg) => {
      if (!msg) return false;
      const content = msg.content;
      // 检查 content 是否为字符串且非空
      return (
        content != null && typeof content === "string" && content.trim() !== ""
      );
    }),
    reverse
  )(msgs); // 直接传递 msgs 数组
};

const TITLE_UPDATE_INTERVAL_HOURS = 6;
// 设置为 true 将跳过时间检查，始终更新标题
const FORCE_UPDATE_FOR_TEST = true;

const shouldUpdateTitle = (lastUpdatedAt: string): boolean => {
  if (FORCE_UPDATE_FOR_TEST) {
    return true;
  }

  const hoursSinceLastUpdate = differenceInHours(
    new Date(),
    new Date(lastUpdatedAt)
  );

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
  const state = thunkApi.getState() as RootState; // 确保类型正确

  const dialogConfig = selectById(state, dialogKey);

  if (!shouldUpdateTitle(dialogConfig.updatedAt)) {
    return dialogConfig;
  }

  const currentMsgs = getFilteredMessages(state); // 使用更新后的函数获取消息
  const content = JSON.stringify(currentMsgs);

  const generateTitle = await dispatch(
    runAgent({
      cybotId: titleCybotId,
      content,
    })
  ).unwrap();

  const formattedDate = format(new Date(), "MM-dd");
  const title = generateTitle || `${cybotConfig.name}_${formattedDate}`;
  //todo update space is need

  const spaceId = selectCurrentSpaceId(state);
  const spaceUpdateResult = dispatch(
    updateContentTitle({ spaceId, contentKey: dialogKey, title })
  );
  const result = await dispatch(
    patch({ dbKey: dialogKey, changes: { title } })
  ).unwrap();

  return result;
};
