import { SpaceMemberWithSpaceInfo } from "app/types";
import {
  MemberRole,
  SpaceVisibility,
  SpaceData,
  SpaceContent,
} from "app/types";
import { selectUserId } from "auth/authSlice";
import { DataType } from "create/types";
import { getUserDataOnce } from "database/utils/getUserDataOnce";
import { ulid } from "ulid";
import { patch, write } from "database/dbSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { CreateSpaceRequest, selectAllMemberSpaces } from "./spaceSlice";
import type { AppDispatch, RootState } from "app/store";

const targetTypes = [DataType.DIALOG, DataType.PAGE];

export const addSpaceAction = async (
  input: CreateSpaceRequest,
  thunkAPI: { dispatch: AppDispatch; getState: () => RootState }
) => {
  const {
    name,
    description = "",
    visibility = SpaceVisibility.PRIVATE,
  } = input;
  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const userId = selectUserId(state);

  if (!userId) {
    throw new Error("User is not logged in.");
  }

  const spaceId = ulid();
  const now = Date.now();
  const nowISO = new Date(now).toISOString();

  let spaceData: SpaceData = {
    id: spaceId,
    name,
    description,
    ownerId: userId,
    visibility,
    members: [userId], // 初始成员只有创建者
    categories: {},
    contents: {},
    createdAt: now,
    updatedAt: now,
    type: DataType.SPACE,
  };

  const spaces = selectAllMemberSpaces(state);
  const hasSpace = spaces.length > 0;
  let sidebarData;
  let needsMigration;

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
      const updatePromises: Promise<any>[] = [];

      for (const item of sidebarData.data) {
        if (!item.id || !item.type) continue;

        contents[item.id] = {
          title: item.title || "",
          type: item.type,
          contentKey: item.id,
          categoryId: "",
          pinned: false, // 假设默认为 false
          createdAt: item.createdAt || now,
          updatedAt: item.updatedAt || now,
          order: item.order ?? undefined, // 保留 order
        };

        if (item.dbKey) {
          updatePromises.push(
            dispatch(
              patch({
                dbKey: item.dbKey,
                changes: {
                  spaceId: spaceId,
                  updatedAt: now,
                },
              })
            )
          );
        }
      }
      spaceData.contents = contents;
      // 等待所有 patch 完成，确保数据一致性
      await Promise.all(updatePromises);
    }
  }

  const spaceKey = createSpaceKey.space(spaceId);
  await dispatch(
    write({
      data: spaceData,
      customKey: spaceKey,
    })
  ).unwrap();

  const spaceMemberKey = createSpaceKey.member(userId, spaceId);
  const spaceMemberData: SpaceMemberWithSpaceInfo = {
    role: MemberRole.OWNER,
    joinedAt: now,
    spaceId: spaceId,
    spaceName: name,
    ownerId: userId, // space 的 ownerId
    visibility,
    type: DataType.SPACE, // 成员记录也标记 type? (根据你的数据模型决定)
    dbKey: spaceMemberKey, // 使用生成的 key
    userId: userId, // 这个成员记录属于哪个 user
    createdAt: nowISO,
    updatedAt: nowISO,
  };

  await dispatch(
    write({
      data: spaceMemberData,
      customKey: spaceMemberKey,
    })
  ).unwrap();

  return spaceMemberData;
};
