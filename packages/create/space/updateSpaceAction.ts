import { selectUserId } from "auth/authSlice";
import { read, patch } from "database/dbSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import type { SpaceMember, SpaceVisibility, SpaceData } from "app/types";
import type { AppDispatch, RootState } from "app/store";

export const updateSpaceAction = async (
  input: {
    spaceId: string;
    name?: string;
    description?: string;
    visibility?: SpaceVisibility;
  },
  thunkAPI: { dispatch: AppDispatch; getState: () => RootState }
) => {
  const { spaceId, name, description, visibility } = input;
  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const userId = selectUserId(state);
  const spaceKey = createSpaceKey.space(spaceId);
  let spaceData: SpaceData | null = null;

  try {
    spaceData = await dispatch(read(spaceKey)).unwrap();
  } catch (readError) {
    throw new Error(
      `无法加载空间数据: ${spaceId}, 原因: ${readError.message || "未知错误"}`
    );
  }

  if (!spaceData.members || !spaceData.members.includes(userId)) {
    throw new Error("当前用户不是空间成员，无法更新空间设置。");
  }

  const changes: Partial<SpaceData> & { updatedAt?: number } = {};
  let hasChanges = false;
  if (name !== undefined && name !== spaceData.name) {
    changes.name = name.trim();
    hasChanges = true;
  }
  if (description !== undefined && description !== spaceData.description) {
    changes.description = description;
    hasChanges = true;
  }
  if (visibility !== undefined && visibility !== spaceData.visibility) {
    changes.visibility = visibility;
    hasChanges = true;
  }

  // 如果没有实际的值变化，直接返回，避免不必要的写入操作
  if (!hasChanges) {
    return { updatedSpace: spaceData, spaceId };
  }

  const now = Date.now();
  changes.updatedAt = now;

  let updatedSpaceData: SpaceData;
  try {
    updatedSpaceData = await dispatch(
      patch({
        dbKey: spaceKey,
        changes,
      })
    ).unwrap();
  } catch (patchError) {
    throw new Error(`更新空间设置失败: ${patchError.message || "未知错误"}`);
  }

  // 如果更新了名称，同步更新当前用户的 space-member 数据
  if (changes.name !== undefined) {
    const memberKey = createSpaceKey.member(userId, spaceId);
    try {
      const memberData = (await dispatch(
        read(memberKey)
      ).unwrap()) as SpaceMember | null;

      if (memberData) {
        const memberChanges = {
          spaceName: changes.name,
          updatedAt: now, // 为 member 数据也设置 updatedAt
        };
        await dispatch(
          patch({
            dbKey: memberKey,
            changes: memberChanges,
          })
        ).unwrap();
      }
    } catch (memberError) {
      // 此处捕获错误，确保即使成员信息更新失败，空间本身的更新也能成功返回
      console.error(
        `Failed to update member data ${memberKey} for space name change:`,
        memberError
      );
    }
  }

  return {
    updatedSpace: updatedSpaceData,
    spaceId,
  };
};
