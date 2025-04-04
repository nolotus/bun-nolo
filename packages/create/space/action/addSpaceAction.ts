import {
  SpaceData,
  SpaceVisibility,
  MemberRole,
  CreateSpaceRequest,
  SpaceContent,
  SpaceMemberWithSpaceInfo,
} from "create/space/types";
import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";
import { getUserDataOnce } from "database/utils/getUserDataOnce";
import { ulid } from "ulid";
import { patchData, write } from "database/dbSlice";
import { createSpaceKey } from "create/space/spaceKeys";

import { selectAllMemberSpaces } from "../spaceSlice";
const targetTypes = [DataType.DIALOG, DataType.PAGE];

export const addSpaceAction = async (input: CreateSpaceRequest, thunkAPI) => {
  const {
    name,
    description = "",
    visibility = SpaceVisibility.PRIVATE,
  } = input;
  const dispatch = thunkAPI.dispatch;
  const state = thunkAPI.getState();
  const userId = selectCurrentUserId(state);
  const spaceId = ulid();
  const now = Date.now();
  let spaceData: SpaceData = {
    id: spaceId,
    name,
    description,
    ownerId: userId,
    visibility,
    members: [userId],
    categories: {},
    contents: {},
    createdAt: now,
    updatedAt: now,
  };
  const spaces = selectAllMemberSpaces(state);
  const hasSpace = spaces.length > 0;
  let sidebarData;
  let needsMigration;
  if (!hasSpace) {
    let hasOldSideData = false;
    // 获取需要迁移的数据
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
    // 如果需要迁移，将现有数据添加到space的contents中
    if (needsMigration && sidebarData.data) {
      const contents: Record<string, SpaceContent> = {};

      for (const item of sidebarData.data) {
        contents[item.id] = {
          title: item.title || "",
          type: item.type,
          contentKey: item.id,
          categoryId: "", // 默认无分类
          pinned: false,
          createdAt: item.createdAt || now,
          updatedAt: item.updatedAt || now,
          order: item.order, // 如果原数据有order则保留
        };
      }

      spaceData.contents = contents;

      // 如果有迁移的数据，更新这些数据的spaceId
      const updatePromises = sidebarData.data.map((item) =>
        dispatch(
          patchData({
            dbKey: item.dbKey,
            changes: {
              spaceId: spaceId,
              updatedAt: now,
            },
          })
        )
      );

      Promise.all(updatePromises);
    }
  }

  // 写入space数据
  const spaceKey = createSpaceKey.space(spaceId);
  console.log("Creating space with key:", spaceKey);
  const spaceResult = await dispatch(
    write({
      data: {
        ...spaceData,
        type: DataType.SPACE,
      },
      customKey: spaceKey,
    })
  ).unwrap();
  console.log("Space created successfully:", spaceResult);

  // 创建space成员数据
  const spaceMemberData: SpaceMemberWithSpaceInfo = {
    role: MemberRole.OWNER,
    joinedAt: now,
    spaceId: spaceId,
    spaceName: name,
    ownerId: userId,
    visibility,
    type: DataType.SPACE,
  };

  // 写入成员数据
  const spaceMemberKey = createSpaceKey.member(userId, spaceId);
  console.log("Creating space member with key:", spaceMemberKey);
  const spaceMemberResult = await dispatch(
    write({
      data: spaceMemberData,
      customKey: spaceMemberKey,
    })
  ).unwrap();
  console.log("SpaceMember ", spaceMemberResult);
  console.log("Space created successfully:", spaceMemberData);
  return spaceMemberData;
};
