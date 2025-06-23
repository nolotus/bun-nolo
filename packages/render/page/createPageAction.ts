// 文件路径: render/page/createPageAction.ts
import { selectUserId } from "auth/authSlice";
import {
  addContentToSpace,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";
import { createPageKey } from "database/keys";
import { t } from "i18next";
import { DataType } from "create/types";
import type { RootState, AppDispatch } from "app/store";
import { write } from "database/dbSlice";
import type { PageData } from "./types";
import { format } from "date-fns";

export const createPageAction = async (
  {
    categoryId,
    spaceId: customSpaceId,
    title: initialTitle,
    addMomentTag,
    content,
    slateData,
  }: {
    categoryId?: string;
    spaceId?: string;
    title?: string;
    addMomentTag?: boolean;
    content?: string;
    slateData?: any;
  } = {},
  { dispatch, getState }: { dispatch: AppDispatch; getState: () => RootState }
): Promise<string> => {
  const state = getState();
  const userId = selectUserId(state);
  if (!userId) throw new Error("User ID not found.");

  const spaceId = customSpaceId || selectCurrentSpaceId(state);
  const { dbKey, id } = createPageKey.create(userId);

  const now = new Date();
  const dateStr = format(now, "yyyy-MM-dd HH:mm");
  const defaultTitle = t("page:defaultTitleFormat", {
    defaultValue: "{{date}} 的笔记",
    date: dateStr,
  });
  const title = initialTitle?.trim() || defaultTitle;

  const tags = addMomentTag ? ["moment"] : undefined;

  const initialSlateData =
    slateData ??
    (content
      ? [{ type: "paragraph", children: [{ text: content }] }]
      : [{ type: "paragraph", children: [{ text: "" }] }]);

  const pageData: PageData = {
    dbKey,
    id,
    type: DataType.PAGE,
    title,
    spaceId,
    slateData: initialSlateData,
    tags,
    created: now.toISOString(),
  };

  await dispatch(write({ data: pageData, customKey: dbKey })).unwrap();

  if (spaceId) {
    dispatch(
      addContentToSpace({
        contentKey: dbKey,
        type: DataType.PAGE,
        spaceId,
        title,
        categoryId,
      })
    );
  }

  return dbKey;
};
