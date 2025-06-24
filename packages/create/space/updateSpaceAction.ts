import { selectUserId } from "auth/authSlice"; // 确认导入路径
import { read, patch } from "database/dbSlice"; // 确认导入路径
import { createSpaceKey } from "create/space/spaceKeys"; // 确认导入路径
import type { SpaceMember } from "app/types";
import type { SpaceVisibility } from "app/types";
import type { SpaceData } from "app/types";
import type { AppDispatch, RootState } from "app/store"; // 假设 store 类型路径
// import { checkSpaceMembership } from "../utils/permissions"; // 导入权限检查函数

// --- 权限检查函数 (暂时注释掉) ---
/*
const checkSpaceAdminOrOwner = (spaceData: SpaceData | null, userId: string | null): void => {
    // ... (实现逻辑) ...
    // console.warn(`[Permission Check] User ${userId} (not owner/admin) attempt to update space ${spaceData.id} settings.`);
    // throw new Error("只有空间所有者或管理员才能修改空间设置。");
};
*/

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

  // --- 输入验证 (可选) ---
  // ...

  const spaceKey = createSpaceKey.space(spaceId);
  let spaceData: SpaceData | null = null;
  try {
    spaceData = await dispatch(read(spaceKey)).unwrap();
  } catch (readError) {
    console.error(
      `[updateSpaceAction] Failed to read space data for key ${spaceKey}:`,
      readError
    );
    throw new Error(
      `无法加载空间数据: ${spaceId}, 原因: ${readError.message || "未知错误"}`
    );
  }

  // --- 权限检查 (暂时注释掉) ---
  /*
  try {
      // checkSpaceAdminOrOwner(spaceData, userId); // 调用严格检查
      // 或者: checkSpaceMembership(spaceData, userId); // 基础成员检查
  } catch (permissionError) {
      throw new Error(`权限不足，无法更新空间设置: ${permissionError.message}`);
  }
  */
  // --- 临时：添加一个基础的成员检查（如果需要，否则也注释掉） ---
  if (!spaceData.members || !spaceData.members.includes(userId)) {
    console.warn(
      `[updateSpaceAction] Basic membership check failed for user ${userId} on space ${spaceId}.`
    );
    throw new Error("当前用户不是空间成员，无法更新空间设置。"); // 或者根据你的需求调整错误信息或逻辑
  }

  // 构建增量更新对象
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

  // 如果没有实际的值变化，直接返回
  if (!hasChanges) {
    console.log(
      `[updateSpaceAction] No actual changes detected for space ${spaceId}. Skipping update.`
    );
    return { updatedSpace: spaceData, spaceId };
  }

  // --- 添加顶层 updatedAt (核心修改) ---
  const now = Date.now(); // 使用 number 类型时间戳
  changes.updatedAt = now; // 1. 设置顶层 updatedAt
  // ------------------------------------

  let updatedSpaceData: SpaceData;
  try {
    updatedSpaceData = await dispatch(
      patch({
        dbKey: spaceKey,
        changes,
      })
    ).unwrap();
  } catch (patchError) {
    console.error(
      `[updateSpaceAction] Failed to patch space data for key ${spaceKey}:`,
      patchError
    );
    throw new Error(`更新空间设置失败: ${patchError.message || "未知错误"}`);
  }

  // --- 如果更新了名称，同步更新当前用户的 space-member 数据 ---
  if (changes.name !== undefined) {
    const memberKey = createSpaceKey.member(userId, spaceId);
    try {
      const memberData = (await dispatch(
        read(memberKey)
      ).unwrap()) as SpaceMember | null;

      if (memberData) {
        const memberChanges = {
          spaceName: changes.name,
          updatedAt: now, // 2. 为 member 数据也设置 updatedAt (假设 types.ts 支持)
        };
        await dispatch(
          patch({
            dbKey: memberKey,
            changes: memberChanges,
          })
        ).unwrap();
        console.log(
          `[updateSpaceAction] Successfully updated member data ${memberKey} with new space name.`
        );
      } else {
        console.warn(
          `[updateSpaceAction] Member data not found for key ${memberKey}. Skipping name update.`
        );
      }
    } catch (memberError) {
      console.error(
        `[updateSpaceAction] Failed to update member data ${memberKey} for space name change:`,
        memberError
      );
      // 这个错误不中断主流程
    }
  }

  // 返回结果
  return {
    updatedSpace: updatedSpaceData,
    spaceId,
  };
};
