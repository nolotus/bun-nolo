import type { SpaceData, ULID } from "app/types";
import { selectUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, patch } from "database/dbSlice";

export const updateContentTitleAction = async (
  input: { spaceId: ULID; contentKey: string; title: string },
  thunkAPI: any
): Promise<{ spaceId: ULID; updatedSpaceData: SpaceData }> => {
  const { spaceId, contentKey, title } = input;
  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const userId = selectUserId(state);

  if (
    !contentKey ||
    typeof contentKey !== "string" ||
    contentKey.trim() === ""
  ) {
    throw new Error("Invalid contentKey provided.");
  }
  if (title === undefined || title === null || typeof title !== "string") {
    throw new Error("Invalid title provided.");
  }

  const spaceKey = createSpaceKey.space(spaceId);
  let spaceData: SpaceData | null = null;
  try {
    spaceData = await dispatch(read(spaceKey)).unwrap();
  } catch (readError) {
    throw new Error(`无法加载空间数据: ${spaceId}`);
  }

  if (!spaceData) {
    throw new Error("Space not found");
  }

  if (!spaceData.members || !spaceData.members.includes(userId)) {
    throw new Error("User is not a member of this space");
  }

  if (!spaceData.contents || !spaceData.contents[contentKey]) {
    throw new Error("Content not found");
  }

  const now = new Date().toISOString();

  const changes = {
    contents: {
      [contentKey]: {
        ...spaceData.contents[contentKey],
        title: title.trim(),
        updatedAt: now,
      },
    },
    updatedAt: now,
  };

  let updatedSpaceData: SpaceData;
  try {
    updatedSpaceData = await dispatch(
      patch({ dbKey: spaceKey, changes })
    ).unwrap();
  } catch (patchError) {
    throw new Error(`更新内容标题失败: ${patchError.message || "未知错误"}`);
  }

  return { spaceId, updatedSpaceData };
};
