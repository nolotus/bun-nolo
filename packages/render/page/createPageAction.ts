// 文件路径: src/render/page/actions/createPageAction.ts (或你的实际路径)

import { selectCurrentUserId } from "auth/authSlice";
import {
  addContentToSpace,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";
import { createPageKey } from "database/keys";
import { t } from "i18next";
import { DataType } from "create/types";
import type { NoloRootState, AppDispatch } from "app/store";
import { ParagraphType, HeadingType } from "create/editor/type"; // 确认导入路径
import { write } from "database/dbSlice";
import type { PageData } from "./types"; // 确认路径
import { format } from "date-fns";
// import { zhCN } from 'date-fns/locale'; // 可选导入

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
  const formattedDate = format(now, dateTimeFormat, {
    /* locale: zhCN */
  });
  const defaultTitle = t("page:defaultTitleFormat", {
    defaultValue: "{{date}} 的笔记",
    date: formattedDate,
  });
  const title = initialTitle?.trim() || defaultTitle;

  const tags: string[] = [];
  if (addMomentTag) {
    tags.push("moment");
  }

  const initialSlateData = [
    { type: HeadingType.H1, children: [{ text: title }] },
    {
      type: ParagraphType,
      children: [
        {
          text: t("page:introTextLine1", {
            defaultValue: "💡 在这里开始记录你的想法吧！",
          }),
        },
      ],
    },
    {
      type: ParagraphType,
      children: [
        {
          text: t("page:introTextLine2", {
            defaultValue: "🚀 试试 Markdown 快捷输入：",
          }),
        },
      ],
    },
    {
      type: ParagraphType,
      children: [
        {
          text: t("page:introShortcutH1", {
            defaultValue: "- `#` + `空格` 创建大标题",
          }),
        },
      ],
    },
    {
      type: ParagraphType,
      children: [
        {
          text: t("page:introShortcutH2", {
            defaultValue: "- `##` + `空格` 创建中标题",
          }),
        },
      ],
    },
    {
      type: ParagraphType,
      children: [
        {
          text: t("page:introShortcutUl", {
            defaultValue: "- `*` + `空格` 创建无序列表",
          }),
        },
      ],
    },
    {
      type: ParagraphType,
      children: [
        {
          text: t("page:introShortcutOl", {
            defaultValue: "- `1.` + `空格` 创建有序列表",
          }),
        },
      ],
    },
    // 移除了引用块和代码块的提示
  ];

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
        categoryId: categoryId, // Directly pass the original categoryId
      })
    );
  }

  return dbKey;
};
