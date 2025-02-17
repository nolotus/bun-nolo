import { selectCurrentUserId } from "auth/authSlice";
import { read, write } from "database/dbSlice";
import { createSpaceKey } from "create/space/spaceKeys";

export const updateSpaceAction = async (
  input: { spaceId: string; spaceName: string },
  thunkAPI
) => {
  const { spaceId, spaceName } = input;
  const dispatch = thunkAPI.dispatch;
  const state = thunkAPI.getState();
  const userId = selectCurrentUserId(state);

  // 获取space数据
  const spaceKey = createSpaceKey.space(spaceId);
  const spaceData = await dispatch(read(spaceKey)).unwrap();

  if (!spaceData) {
    throw new Error("Space not found");
  }

  if (!spaceData.members.includes(userId)) {
    throw new Error("User is not a member of this space");
  }

  // 更新space数据
  const updatedSpaceData = {
    ...spaceData,
    name: spaceName,
    updatedAt: Date.now(),
  };

  // 写入更新后的space数据
  await dispatch(
    write({
      data: updatedSpaceData,
      customKey: spaceKey,
    })
  ).unwrap();

  // 更新space-member数据
  const memberKey = createSpaceKey.member(userId, spaceId);
  const memberData = await dispatch(read(memberKey)).unwrap();

  if (memberData) {
    const updatedMemberData = {
      ...memberData,
      spaceName,
    };

    await dispatch(
      write({
        data: updatedMemberData,
        customKey: memberKey,
      })
    ).unwrap();
  }

  return {
    updatedSpace: updatedSpaceData,
    spaceId,
  };
};
