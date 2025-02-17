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

export const addSpaceAction = async (input: CreateSpaceRequest, thunkAPI) => {
  const {
    name,
    description = "",
    visibility = SpaceVisibility.PRIVATE,
  } = input;
  const dispatch = thunkAPI.dispatch;
  const state = thunkAPI.getState();
  const userId = selectCurrentUserId(state);

  // 获取需要迁移的数据
  const targetTypes = [DataType.DIALOG, DataType.PAGE];
  const sidebarData = await getUserDataOnce({
    types: targetTypes,
    userId,
    limit: 100,
  });

  const hasOldSideData =
    Array.isArray(sidebarData.data) && sidebarData.data.length > 0;

  const spaces = selectAllMemberSpaces(state);
  const hasSpace = spaces.length > 0;

  const needsMigration = hasOldSideData && !hasSpace;

  // 创建新的space
  const spaceId = ulid();
  const now = Date.now();

  const spaceData: SpaceData = {
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
  }

  // 写入space数据
  console.log("Creating space with data:", spaceData);
  const result = await dispatch(
    write({
      data: {
        ...spaceData,
        type: DataType.SPACE,
      },
      customKey: createSpaceKey.space(spaceId),
    })
  ).unwrap();

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
  await dispatch(
    write({
      data: spaceMemberData,
      customKey: createSpaceKey.member(userId, spaceId),
    })
  ).unwrap();

  // 如果有迁移的数据，更新这些数据的spaceId
  if (needsMigration && sidebarData.data) {
    const updatePromises = sidebarData.data.map((item) =>
      dispatch(
        patchData({
          id: item.id,
          changes: {
            spaceId: spaceId,
            updatedAt: now,
          },
        })
      )
    );

    await Promise.all(updatePromises);
  }

  console.log("Space created successfully:", spaceMemberData);
  return spaceMemberData;
};
