// 文件路径: render/page/createPageAction.ts
import { selectCurrentUserId } from "auth/authSlice";
import {
  addContentToSpace,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";
import { createPageKey } from "database/keys";
import { t } from "i18next";
import { DataType } from "create/types";
import type { NoloRootState, AppDispatch } from "app/store";
import { write } from "database/dbSlice";
import type { PageData } from "./types";
import { format } from "date-fns";
import { getInitialPageContent } from "./initialPageContent"; // 引入初始化内容

/**
 * 异步 Action Thunk (Standalone): 创建一个新页面。
 */
export const createPageAction = async (
  args: {
    categoryId?: string;
    spaceId?: string;
    title?: string;
    addMomentTag?: boolean;
  } = {},
  thunkAPI: { dispatch: AppDispatch; getState: () => NoloRootState }
): Promise<string> => {
  const {
    categoryId,
    spaceId: customSpaceId,
    title: initialTitle,
    addMomentTag,
  } = args;
  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const userId = selectCurrentUserId(state);
  const effectiveSpaceId = customSpaceId || selectCurrentSpaceId(state);

  if (!userId) {
    throw new Error("User ID not found.");
  }

  const { dbKey, id } = createPageKey.create(userId);

  const now = new Date();
  const dateTimeFormat = "yyyy-MM-dd HH:mm";
  const formattedDate = format(now, dateTimeFormat);
  const defaultTitle = t("page:defaultTitleFormat", {
    defaultValue: "{{date}} 的笔记",
    date: formattedDate,
  });
  const title = initialTitle?.trim() || defaultTitle;

  const tags: string[] = [];
  if (addMomentTag) {
    tags.push("moment");
  }

  // 使用提取的初始化内容
  const initialSlateData = getInitialPageContent(title);

  const pageData: PageData = {
    dbKey,
    id,
    type: DataType.PAGE,
    title,
    spaceId: effectiveSpaceId,
    slateData: initialSlateData,
    tags: tags.length > 0 ? tags : undefined,
    created: now.toISOString(),
  };

  await dispatch(write({ data: pageData, customKey: dbKey })).unwrap();

  if (effectiveSpaceId) {
    dispatch(
      addContentToSpace({
        contentKey: dbKey,
        type: DataType.PAGE,
        spaceId: effectiveSpaceId,
        title: pageData.title,
        categoryId: categoryId,
      })
    );
  }

  return dbKey;
};
