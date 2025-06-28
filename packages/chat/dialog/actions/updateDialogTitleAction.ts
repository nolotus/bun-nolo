import { runAgent } from "ai/cybot/cybotSlice";
import { titleAgentId } from "core/init";
import {
  selectCurrentSpaceId,
  updateContentTitle,
} from "create/space/spaceSlice";
import { patch, selectById } from "database/dbSlice";
import { format, differenceInMinutes } from "date-fns"; // 从 differenceInHours 改为 differenceInMinutes

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

// 更新间隔改为3分钟
const TITLE_UPDATE_INTERVAL_MINUTES = 3;
// 关闭强制更新，启用时间检查
const FORCE_UPDATE_FOR_TEST = false;

const shouldUpdateTitle = (lastUpdatedAt: string): boolean => {
  if (FORCE_UPDATE_FOR_TEST) {
    return true;
  }

  const minutesSinceLastUpdate = differenceInMinutes(
    new Date(),
    new Date(lastUpdatedAt)
  );

  const shouldUpdate = minutesSinceLastUpdate >= TITLE_UPDATE_INTERVAL_MINUTES;
  if (!shouldUpdate) {
    console.log(
      `Title update skipped: last update was ${minutesSinceLastUpdate} minutes ago. Need to wait for ${TITLE_UPDATE_INTERVAL_MINUTES} minutes.`
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
      cybotId: titleAgentId,
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
