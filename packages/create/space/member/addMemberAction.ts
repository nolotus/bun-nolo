import type { SpaceId } from "create/space/types";
import type { MemberRole } from "app/types";
import type { SpaceData } from "app/types";
import { selectUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, write } from "database/dbSlice";
import { SpaceMemberWithSpaceInfo } from "app/types";
import { DataType } from "create/types";

/**
 * 添加成员到空间
 *
 * 说明：
 * 1. 当前用户必须为空间现有成员，才可以添加新成员；
 * 2. 如果成员已存在则直接报错；
 * 3. 更新 SpaceData.members 数组，同时为新成员创建 SpaceMemberWithSpaceInfo 数据。
 */
export const addMemberAction = async (
  input: { spaceId: SpaceId; memberId: string; role?: MemberRole },
  thunkAPI: any
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { spaceId, memberId, role = MemberRole.MEMBER } = input; // 默认角色为 MEMBER
  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const currentUserId = selectUserId(state);

  const spaceKey = createSpaceKey.space(spaceId);
  const spaceData: SpaceData | null = await dispatch(read(spaceKey)).unwrap();

  if (!spaceData) {
    throw new Error("Space not found");
  }
  // 检查当前用户是否为该空间的成员
  if (!spaceData.members.includes(currentUserId)) {
    throw new Error("当前用户不是空间成员，无法添加成员");
  }
  // 检查待添加的成员是否已存在
  if (spaceData.members.includes(memberId)) {
    throw new Error("成员已存在");
  }

  // 更新 SpaceData
  const updatedSpaceData: SpaceData = {
    ...spaceData,
    members: [...spaceData.members, memberId],
    updatedAt: Date.now(),
  };

  // 写入更新后的 SpaceData
  await dispatch(
    write({ data: updatedSpaceData, customKey: spaceKey })
  ).unwrap();

  // 创建并写入新成员的 SpaceMemberWithSpaceInfo 数据
  const now = Date.now();
  const spaceMemberData: SpaceMemberWithSpaceInfo = {
    role: role, // 使用传入的 role，默认为 MEMBER
    joinedAt: now,
    updatedAt: now, // 可选字段，初始化时设置为当前时间
    spaceId: spaceId,
    spaceName: spaceData.name,
    ownerId: spaceData.ownerId,
    visibility: spaceData.visibility,
    type: DataType.SPACE, // 添加 type 字段
  };

  const spaceMemberKey = createSpaceKey.member(memberId, spaceId);
  await dispatch(
    write({
      data: spaceMemberData,
      customKey: spaceMemberKey,
    })
  ).unwrap();

  return { spaceId, updatedSpaceData };
};
