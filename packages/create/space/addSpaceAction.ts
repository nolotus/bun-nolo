import {
  SpaceData,
  SpaceVisibility,
  MemberRole,
  CreateSpaceRequest,
  SpaceContent,
  SpaceMemberWithSpaceInfo, // 确保这个类型包含了新增的字段 (dbKey, userId, createdAt, updatedAt)
} from "create/space/types"; // 确认导入路径
import { selectCurrentUserId } from "auth/authSlice"; // 确认导入路径
import { DataType } from "create/types"; // 确认导入路径
import { getUserDataOnce } from "database/utils/getUserDataOnce"; // 确认导入路径
import { ulid } from "ulid";
import { patch, write, read } from "database/dbSlice"; // 确认导入路径 (添加 read)
import { createSpaceKey } from "create/space/spaceKeys"; // 确认导入路径
import { selectAllMemberSpaces } from "./spaceSlice"; // 确认导入路径
import type { AppDispatch, NoloRootState } from "app/store"; // 假设 store 类型路径

const targetTypes = [DataType.DIALOG, DataType.PAGE];

export const addSpaceAction = async (
  input: CreateSpaceRequest,
  thunkAPI: { dispatch: AppDispatch; getState: () => NoloRootState } // 使用具体类型
) => {
  const {
    name,
    description = "",
    visibility = SpaceVisibility.PRIVATE,
  } = input;
  const { dispatch, getState } = thunkAPI; // 显式解构 dispatch 和 getState
  const state = getState();
  const userId = selectCurrentUserId(state);
  if (!userId) {
    // 添加 userId 验证
    throw new Error("User is not logged in.");
  }
  const spaceId = ulid();
  const now = Date.now();
  const nowISO = new Date(now).toISOString(); // 获取 ISO 格式时间戳

  let spaceData: SpaceData = {
    id: spaceId,
    name,
    description,
    ownerId: userId,
    visibility,
    members: [userId], // 初始成员只有创建者
    categories: {},
    contents: {},
    createdAt: now, // 或者 nowISO，取决于 SpaceData 定义
    updatedAt: now, // 或者 nowISO
    type: DataType.SPACE, // 添加 type
  };

  const spaces = selectAllMemberSpaces(state);
  const hasSpace = spaces.length > 0;
  let sidebarData;
  let needsMigration;

  // --- 迁移逻辑 (保持不变) ---
  if (!hasSpace) {
    let hasOldSideData = false;
    sidebarData = await getUserDataOnce({
      types: targetTypes,
      userId,
      limit: 100,
    });
    if (sidebarData.data) {
      hasOldSideData =
        Array.isArray(sidebarData.data) && sidebarData.data.length > 0;
    }
    needsMigration = hasOldSideData && !hasSpace;
    if (needsMigration && sidebarData.data) {
      const contents: Record<string, SpaceContent> = {};
      const updatePromises: Promise<any>[] = []; // 明确 Promise 类型

      for (const item of sidebarData.data) {
        // 确保 item 有 id 和 type
        if (!item.id || !item.type) continue;

        contents[item.id] = {
          title: item.title || "",
          type: item.type,
          contentKey: item.id,
          categoryId: "",
          pinned: false, // 假设默认为 false
          createdAt: item.createdAt || now, // 或 nowISO
          updatedAt: item.updatedAt || now, // 或 nowISO
          order: item.order ?? undefined, // 保留 order
        };

        // 确保 item 有 dbKey
        if (item.dbKey) {
          updatePromises.push(
            dispatch(
              patch({
                dbKey: item.dbKey,
                changes: {
                  spaceId: spaceId,
                  updatedAt: now, // 或 nowISO
                },
              })
            )
          );
        } else {
          console.warn(`Item ${item.id} is missing dbKey, skipping patch.`);
        }
      }
      spaceData.contents = contents;
      // 等待所有 patch 完成 (可选，但更健壮)
      await Promise.all(updatePromises);
      console.log("[addSpaceAction] Data migration patches completed.");
    }
  }

  // 写入 space 数据
  const spaceKey = createSpaceKey.space(spaceId);
  console.log("[addSpaceAction] Creating space with key:", spaceKey);
  await dispatch(
    write({
      data: spaceData, // spaceData 已包含 type
      customKey: spaceKey,
    })
  ).unwrap();
  console.log("[addSpaceAction] Space created successfully:", spaceId);

  // 创建 space 成员数据 (包含更多字段)
  const spaceMemberKey = createSpaceKey.member(userId, spaceId); // 先生成 Key
  const spaceMemberData: SpaceMemberWithSpaceInfo = {
    // --- 核心字段 ---
    role: MemberRole.OWNER,
    joinedAt: now,
    spaceId: spaceId,
    spaceName: name,
    ownerId: userId, // space 的 ownerId
    visibility,
    type: DataType.SPACE, // 成员记录也标记 type? (根据你的数据模型决定)
    // --- 新增的补充字段，使其结构更完整 ---
    dbKey: spaceMemberKey, // 使用生成的 key
    userId: userId, // 这个成员记录属于哪个 user
    createdAt: nowISO, // ISO 格式时间戳
    updatedAt: nowISO, // ISO 格式时间戳
  };

  // 写入成员数据
  console.log(
    "[addSpaceAction] Creating space member with key:",
    spaceMemberKey
  );
  await dispatch(
    write({
      data: spaceMemberData,
      customKey: spaceMemberKey,
    })
  ).unwrap();
  console.log(
    "[addSpaceAction] SpaceMember created successfully for user:",
    userId
  );

  // 返回构建的、更完整的 spaceMemberData 对象
  console.log("[addSpaceAction] Returning space member data:", spaceMemberData);
  return spaceMemberData;
};
