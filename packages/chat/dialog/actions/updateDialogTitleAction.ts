import { runAgent } from "ai/cybot/cybotSlice";
import { RootState } from "app/store";
import { titleAgentId } from "core/init";
import {
  selectCurrentSpaceId,
  updateContentTitle,
} from "create/space/spaceSlice";
import { patch, selectById } from "database/dbSlice";
import { differenceInMinutes, format } from "date-fns";
import { filter, flatten, pipe, reverse, take } from "rambda";
import { selectAllMsgs } from "../../messages/messageSlice";

// --- 常量 ---
const TITLE_UPDATE_INTERVAL_MINUTES = 3;
const FORCE_UPDATE_FOR_TEST = false;
const MAX_MESSAGES_FOR_CONTEXT = 20;
const MESSAGE_SAMPLING_THRESHOLD = 10;

// --- 辅助函数 ---
const getMessageContextForTitle = (state: RootState) =>
  pipe(
    flatten,
    filter(
      (msg: any) =>
        msg?.content &&
        typeof msg.content === "string" &&
        msg.content.trim() !== ""
    ),
    reverse,
    (messages: any[]) => {
      if (messages.length <= MESSAGE_SAMPLING_THRESHOLD) return messages;
      const step = Math.ceil(messages.length / MAX_MESSAGES_FOR_CONTEXT);
      return messages.filter((_, index) => index % step === 0);
    },
    take(MAX_MESSAGES_FOR_CONTEXT)
  )(selectAllMsgs(state));

const shouldUpdateTitle = (
  createdAt?: string,
  lastUpdatedAt?: string
): boolean => {
  if (FORCE_UPDATE_FOR_TEST) return true;
  const lastUpdate = lastUpdatedAt ? new Date(lastUpdatedAt) : null;
  const creation = createdAt ? new Date(createdAt) : null;
  if (
    !lastUpdate ||
    !creation ||
    isNaN(lastUpdate.getTime()) ||
    isNaN(creation.getTime())
  )
    return true;

  const now = new Date();
  return (
    differenceInMinutes(now, creation) <= TITLE_UPDATE_INTERVAL_MINUTES ||
    differenceInMinutes(now, lastUpdate) >= TITLE_UPDATE_INTERVAL_MINUTES
  );
};

// --- 异步 Thunk Action ---
export const updateDialogTitleAction = async (args, thunkApi) => {
  const { dialogKey, cybotConfig } = args;
  const { dispatch, getState } = thunkApi;
  const state = getState() as RootState;

  const dialogConfig = selectById(state, dialogKey);
  if (
    !dialogConfig ||
    !shouldUpdateTitle(dialogConfig.createdAt, dialogConfig.updatedAt)
  ) {
    return dialogConfig;
  }

  const messageContext = getMessageContextForTitle(state);
  if (messageContext.length === 0) {
    return dialogConfig;
  }

  const content = JSON.stringify(
    messageContext.map((msg) => ({ role: msg.role, content: msg.content }))
  );

  const generatedTitle = await dispatch(
    runAgent({ cybotId: titleAgentId, content })
  ).unwrap();
  const title =
    generatedTitle?.trim() ||
    `${cybotConfig.name} on ${format(new Date(), "MMM d")}`;

  const spaceId = selectCurrentSpaceId(state);
  if (spaceId) {
    dispatch(updateContentTitle({ spaceId, contentKey: dialogKey, title }));
  }

  return await dispatch(
    patch({ dbKey: dialogKey, changes: { title } })
  ).unwrap();
};
