import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, remove } from "database/dbSlice";

// 定义ThunkAPI的通用类型（根据redux-thunk的用法）
interface ThunkAPI {
  dispatch: (action: any) => any;
  getState: () => any; // 如果有RootState类型，可替换为RootState
}

const getCurrentUserId = (state: any): string => selectCurrentUserId(state);

const fetchSpaceData = async (
  spaceId: string,
  dispatch: ThunkAPI["dispatch"]
) => {
  const spaceKey = createSpaceKey.space(spaceId);
  try {
    return await dispatch(read(spaceKey)).unwrap();
  } catch (error) {
    console.warn(`Failed to read space ${spaceId}:`, error);
    return undefined;
  }
};

const checkOwnerPermission = (spaceData: any | undefined, userId: string) => {
  if (spaceData && spaceData.ownerId !== userId) {
    throw new Error("Only owner can delete space");
  }
};

const deleteSpaceData = async (
  spaceId: string,
  dispatch: ThunkAPI["dispatch"]
) => {
  const spaceKey = createSpaceKey.space(spaceId);
  try {
    await dispatch(remove(spaceKey)).unwrap();
  } catch (error) {
    console.warn(`Failed to delete space ${spaceId}:`, error);
  }
};

const deleteAllMembers = async (
  spaceData: any | undefined,
  spaceId: string,
  dispatch: ThunkAPI["dispatch"]
) => {
  if (spaceData?.members) {
    for (const memberId of spaceData.members) {
      const memberKey = createSpaceKey.member(memberId, spaceId);
      await dispatch(remove(memberKey))
        .unwrap()
        .catch((err) =>
          console.warn(
            `Failed to delete member ${memberId} for space ${spaceId}:`,
            err
          )
        );
    }
  }
};

const deleteCurrentUserMember = async (
  userId: string,
  spaceId: string,
  dispatch: ThunkAPI["dispatch"]
) => {
  const currentUserMemberKey = createSpaceKey.member(userId, spaceId);
  await dispatch(remove(currentUserMemberKey))
    .unwrap()
    .catch((err) =>
      console.warn(
        `Failed to delete member key for user ${userId} in space ${spaceId}:`,
        err
      )
    );
};

export const deleteSpaceAction = async (
  spaceId: string,
  thunkAPI: ThunkAPI
) => {
  const { dispatch, getState } = thunkAPI;
  const userId = getCurrentUserId(getState());
  const spaceData = await fetchSpaceData(spaceId, dispatch);

  checkOwnerPermission(spaceData, userId);
  await deleteSpaceData(spaceId, dispatch);
  await deleteAllMembers(spaceData, spaceId, dispatch);
  await deleteCurrentUserMember(userId, spaceId, dispatch);

  return { spaceId };
};
