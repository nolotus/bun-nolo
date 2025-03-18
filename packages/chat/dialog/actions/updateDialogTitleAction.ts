import { runCybotId } from "ai/cybot/cybotSlice";
import { titleCybotId } from "core/init";
import {
  selectCurrentSpaceId,
  updateContentTitle,
} from "create/space/spaceSlice";
import { patchData, selectById } from "database/dbSlice";
import { format, differenceInHours } from "date-fns";

import { NoloRootState } from "app/store";
import { pipe, flatten, filter, reverse } from "rambda";

export const getFilteredMessages = (state: NoloRootState) => {
  const msgs = state.message.msgs;

  return pipe(
    flatten,
    // 过滤掉 null/undefined 和 content 为空的消息
    filter((msg) => {
      if (!msg) return false;
      const content = msg.content;
      return content != null && content.trim() !== "";
    }),
    reverse
  )([msgs]);
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
  const state = thunkApi.getState();

  const dialogConfig = selectById(state, dialogKey);

  if (!shouldUpdateTitle(dialogConfig.updatedAt)) {
    return dialogConfig;
  }

  const currentMsgs = getFilteredMessages(state);
  const content = JSON.stringify(currentMsgs);

  const generateTitle = await dispatch(
    runCybotId({
      cybotId: titleCybotId,
      userInput: content,
    })
  ).unwrap();

  const formattedDate = format(new Date(), "MM-dd");
  const title = generateTitle || `${cybotConfig.name}_${formattedDate}`;
  //todo  update space is need

  const spaceId = selectCurrentSpaceId(state);
  const spaceUpdateResult = dispatch(
    updateContentTitle({ spaceId, contentKey: dialogKey, title })
  );
  const result = await dispatch(
    patchData({ dbKey: dialogKey, changes: { title } })
  ).unwrap();

  return result;
};
