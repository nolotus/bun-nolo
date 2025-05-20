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

/**
 * 异步 Action Thunk (Standalone): 创建一个新页面。
 */
export const createPageAction = async (
  args: {
    categoryId?: string;
    spaceId?: string;
    title?: string;
    addMomentTag?: boolean;
    content?: string; // 可选参数 content，纯字符串
    slateData?: any; // 新增可选参数 slateData，用于传入 SlateJS 数据结构
  } = {},
  thunkAPI: { dispatch: AppDispatch; getState: () => NoloRootState }
): Promise<string> => {
  const {
    categoryId,
    spaceId: customSpaceId,
    title: initialTitle,
    addMomentTag,
    content, // 纯字符串内容
    slateData, // SlateJS 数据结构
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

  // 初始化 slateData 为空内容
  const emptySlateData = [
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ];

  // 确定初始 slateData 的值
  let initialSlateData;
  if (slateData) {
    // 如果传入了 slateData，优先使用它
    initialSlateData = slateData;
  } else if (content) {
    // 如果没有 slateData 但传入了 content，将 content 转换为 SlateJS 格式
    initialSlateData = [
      {
        type: "paragraph",
        children: [{ text: content }],
      },
    ];
  } else {
    // 如果都没有传入，使用默认空内容
    initialSlateData = emptySlateData;
  }

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
