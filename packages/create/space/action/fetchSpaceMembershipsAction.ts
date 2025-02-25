import type { SpaceId, SpaceData } from "create/space/types";
import { createSpaceKey } from "create/space/spaceKeys";
import { read } from "database/dbSlice";

/**
 * 获取指定空间的成员列表
 *
 * 说明：
 * 1. 根据传入的 spaceId 通过数据库读取空间数据；
 * 2. 如果空间不存在，则抛出异常；
 * 3. 返回包含 spaceId 以及成员列表（成员ID 数组）的对象。
 */
export const fetchSpaceMembershipsAction = async (
  input: { spaceId: SpaceId },
  thunkAPI: any
): Promise<{ spaceId: SpaceId; members: string[] }> => {
  const { spaceId } = input;
  const { dispatch } = thunkAPI;
  const spaceKey = createSpaceKey.space(spaceId);

  const spaceData: SpaceData | null = await dispatch(read(spaceKey)).unwrap();
  if (!spaceData) {
    throw new Error("Space not found");
  }

  return { spaceId, members: spaceData.members };
};
